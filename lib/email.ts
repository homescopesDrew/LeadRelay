import { Resend } from "resend";
import { db, logSystemEvent } from "@/lib/db";

let resendClient: Resend | null = null;
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resendClient) resendClient = new Resend(key);
  return resendClient;
}
const FROM = process.env.EMAIL_FROM ?? "LeadRelay <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function layout(title: string, body: string) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;background:#f4f6f7;padding:32px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e3e8ea;border-radius:8px;overflow:hidden">
      <div style="background:#1d242c;padding:16px 24px">
        <span style="color:#f96a16;font-weight:800;font-size:18px;letter-spacing:.04em">LEAD</span><span style="color:#fff;font-weight:800;font-size:18px;letter-spacing:.04em">RELAY</span>
      </div>
      <div style="padding:24px">
        <h2 style="margin:0 0 12px;color:#1d242c;font-size:20px">${title}</h2>
        ${body}
      </div>
      <div style="padding:16px 24px;border-top:1px solid #e3e8ea;color:#6b8392;font-size:12px">
        You're receiving this because you have a LeadRelay account.
        <a href="${APP_URL}/dashboard" style="color:#2f6db5">Manage notifications</a>
      </div>
    </div>
  </div>`;
}

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

async function send(opts: {
  to: string;
  subject: string;
  html: string;
  logType: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email", opts.logType);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html });
    await db.notificationLog.create({
      data: { userId: opts.userId, type: opts.logType, metadata: opts.metadata as object },
    });
  } catch (err) {
    console.error("Email send failed", opts.logType, err);
    await logSystemEvent("ERROR", { scope: "email", logType: opts.logType, message: String(err) });
  }
}

type LeadLike = {
  id: string;
  jobType: string;
  locationZip: string;
  budgetMin: number;
  budgetMax: number;
  description: string;
  urgency: string;
  price: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
};

export async function sendNewLeadMatchEmail(to: string, userId: string, lead: LeadLike) {
  await send({
    to,
    userId,
    logType: "NEW_LEAD_MATCH",
    metadata: { leadId: lead.id },
    subject: `New ${lead.jobType} lead in ${lead.locationZip} — ${fmt(lead.price)}`,
    html: layout(
      "A lead just hit the board in your area",
      `<p style="color:#3b4854">A <strong>${lead.jobType}</strong> job in <strong>${lead.locationZip}</strong> was just listed.</p>
       <ul style="color:#3b4854">
         <li>Budget: ${fmt(lead.budgetMin)}–${fmt(lead.budgetMax)}</li>
         <li>Urgency: ${lead.urgency}</li>
         <li>Lead price: <strong>${fmt(lead.price)}</strong></li>
       </ul>
       <a href="${APP_URL}/lead/${lead.id}" style="display:inline-block;background:#f96a16;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:700">View lead</a>`
    ),
  });
}

export async function sendBuyerLeadEmail(to: string, userId: string, lead: LeadLike) {
  await send({
    to,
    userId,
    logType: "LEAD_SOLD_BUYER",
    metadata: { leadId: lead.id },
    subject: `Your lead is ready: ${lead.jobType} in ${lead.locationZip}`,
    html: layout(
      "Here's your lead — call them while it's hot",
      `<p style="color:#3b4854">${lead.description}</p>
       <table style="color:#1d242c;font-size:15px">
         <tr><td style="padding:4px 12px 4px 0;color:#6b8392">Customer</td><td><strong>${lead.contactName}</strong></td></tr>
         <tr><td style="padding:4px 12px 4px 0;color:#6b8392">Phone</td><td><strong>${lead.contactPhone}</strong></td></tr>
         <tr><td style="padding:4px 12px 4px 0;color:#6b8392">Email</td><td><strong>${lead.contactEmail}</strong></td></tr>
         <tr><td style="padding:4px 12px 4px 0;color:#6b8392">Budget</td><td>${fmt(lead.budgetMin)}–${fmt(lead.budgetMax)}</td></tr>
         <tr><td style="padding:4px 12px 4px 0;color:#6b8392">Urgency</td><td>${lead.urgency}</td></tr>
       </table>
       <p style="color:#6b8392;font-size:13px;margin-top:16px">This info is also saved in <a href="${APP_URL}/dashboard" style="color:#2f6db5">your dashboard</a>.</p>`
    ),
  });
}

export async function sendSellerSoldEmail(
  to: string,
  userId: string,
  lead: LeadLike,
  payoutCents: number
) {
  await send({
    to,
    userId,
    logType: "LEAD_SOLD_SELLER",
    metadata: { leadId: lead.id, payoutCents },
    subject: `Sold: your ${lead.jobType} lead earned you ${fmt(payoutCents)}`,
    html: layout(
      "Your lead sold",
      `<p style="color:#3b4854">Your <strong>${lead.jobType}</strong> lead in <strong>${lead.locationZip}</strong> just sold for ${fmt(
        lead.price
      )}. After the marketplace fee, your payout is <strong>${fmt(payoutCents)}</strong>.</p>
       <a href="${APP_URL}/dashboard" style="display:inline-block;background:#1d242c;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:700">View dashboard</a>`
    ),
  });
}

export async function sendWeeklySummaryEmail(
  to: string,
  userId: string,
  stats: { newLeads: number; soldLeads: number; topTrade: string | null }
) {
  await send({
    to,
    userId,
    logType: "WEEKLY_SUMMARY",
    metadata: stats,
    subject: "Your weekly LeadRelay rundown",
    html: layout(
      "This week on the board",
      `<ul style="color:#3b4854">
         <li><strong>${stats.newLeads}</strong> new leads posted</li>
         <li><strong>${stats.soldLeads}</strong> leads sold</li>
         ${stats.topTrade ? `<li>Hottest trade: <strong>${stats.topTrade}</strong></li>` : ""}
       </ul>
       <a href="${APP_URL}/marketplace" style="display:inline-block;background:#f96a16;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:700">Browse the board</a>`
    ),
  });
}

export async function sendAdminAlert(subject: string, detail: string, metadata?: Record<string, unknown>) {
  const admin = process.env.ADMIN_EMAIL;
  if (!admin) return;
  await send({
    to: admin,
    logType: "ADMIN_ALERT",
    metadata,
    subject: `[LeadRelay alert] ${subject}`,
    html: layout(subject, `<pre style="white-space:pre-wrap;color:#3b4854;font-size:13px">${detail}</pre>`),
  });
}

export async function sendMonthlyRevenueReport(stats: {
  month: string;
  feeRevenue: number;
  transactions: number;
  newUsers: number;
  leadsPosted: number;
}) {
  const admin = process.env.ADMIN_EMAIL;
  if (!admin) return;
  await send({
    to: admin,
    logType: "MONTHLY_REPORT",
    metadata: stats,
    subject: `LeadRelay revenue report — ${stats.month}`,
    html: layout(
      `Revenue report: ${stats.month}`,
      `<ul style="color:#3b4854">
         <li>Fee revenue: <strong>${fmt(stats.feeRevenue)}</strong></li>
         <li>Transactions: <strong>${stats.transactions}</strong></li>
         <li>Leads posted: <strong>${stats.leadsPosted}</strong></li>
         <li>New users: <strong>${stats.newUsers}</strong></li>
       </ul>`
    ),
  });
}
