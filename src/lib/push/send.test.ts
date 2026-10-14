import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const sendNotification = vi.fn();
vi.mock("web-push", () => ({ default: { sendNotification: (...args: unknown[]) => sendNotification(...args) } }));

const { buildReminderPush } = await import("@/lib/reminders/email-template");
const { sendPushToUser } = await import("./send");

type Device = { id: string; endpoint: string; p256dh: string; auth: string };

function fakeAdmin(devices: Device[]) {
  const deleted: string[] = [];
  const admin = {
    from: () => ({
      select: () => ({ eq: async () => ({ data: devices, error: null }) }),
      delete: () => ({
        eq: async (_column: string, id: string) => {
          deleted.push(id);
          return { error: null };
        },
      }),
    }),
  };
  return { admin: admin as never, deleted };
}

const config = { publicKey: "pub", privateKey: "priv", subject: "mailto:test@example.pl" };

describe("push notifications", () => {
  beforeEach(() => sendNotification.mockReset());

  it("sends to every device and removes expired ones", async () => {
    const { admin, deleted } = fakeAdmin([
      { id: "a", endpoint: "https://push/a", p256dh: "k1", auth: "s1" },
      { id: "b", endpoint: "https://push/b", p256dh: "k2", auth: "s2" },
      { id: "c", endpoint: "https://push/c", p256dh: "k3", auth: "s3" },
    ]);
    sendNotification
      .mockResolvedValueOnce({ statusCode: 201 })
      .mockRejectedValueOnce(Object.assign(new Error("gone"), { statusCode: 410 }))
      .mockRejectedValueOnce(Object.assign(new Error("server"), { statusCode: 500 }));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const delivered = await sendPushToUser(admin, config, "user", { title: "T", body: "B", url: "/panel" });

    expect(delivered).toBe(1);
    expect(deleted).toEqual(["b"]);
    const [subscription, body, options] = sendNotification.mock.calls[0];
    expect(subscription).toEqual({ endpoint: "https://push/a", keys: { p256dh: "k1", auth: "s1" } });
    expect(JSON.parse(body)).toEqual({ title: "T", body: "B", url: "/panel" });
    expect(options.vapidDetails).toEqual({ subject: "mailto:test@example.pl", publicKey: "pub", privateKey: "priv" });
  });

  it("does nothing for users without devices", async () => {
    const { admin } = fakeAdmin([]);
    expect(await sendPushToUser(admin, config, "user", { title: "T", body: "B", url: "/" })).toBe(0);
    expect(sendNotification).not.toHaveBeenCalled();
  });

  it("builds short reminder texts", () => {
    const base = { subscriptionName: "Netflix", amountCents: 4900, eventDate: "2026-10-17", today: "2026-10-14", subscriptionId: "s1" };
    const payment = buildReminderPush({ ...base, kind: "payment" });
    expect(payment.title).toBe("Netflix: płatność za 3 dni");
    expect(payment.body.replace(/ /g, " ")).toBe("49,00 zł · 17 października 2026");
    expect(payment.url).toBe("/panel/subskrypcje/s1");
    const trial = buildReminderPush({ ...base, kind: "trial_end" });
    expect(trial.title).toBe("Netflix: okres próbny kończy się za 3 dni");
    expect(trial.tag).toBe("trial_end-s1-2026-10-17");
  });
});
