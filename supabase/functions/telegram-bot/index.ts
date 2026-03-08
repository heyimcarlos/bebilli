import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLATFORM = "telegram";

// Translations mirror whatsapp-bot but with Telegram-specific formatting
const t = {
  pt: {
    ranking: "Ranking", progress: "Progresso", daysLeft: "Faltam {n} dias", ofSalary: "do salário",
    groupCreated: "✅ Grupo criado com sucesso!", goal: "Meta", deadline: "Prazo", inviteCode: "Código de convite",
    contributionAdded: "✅ Aporte registrado!", total: "Total", of: "de",
    salaryRegistered: "✅ Seu salário foi registrado de forma privada.", 
    competitionStarted: "🏆 Modo competição ativado!",
    champion: "Campeã 👑", lastPlace: "Vai que vai! 💪",
    badges: "Badges", noBadges: "Nenhum badge ainda.",
    coupons: "Cupons disponíveis", noCoupons: "Nenhum cupom disponível.",
    help: "📋 *Comandos:*\n/criar\\_meta — Criar grupo\n/aporte — Registrar aporte\n/ranking — Ver ranking\n/progresso — Ver progresso\n/competição — Ativar competição\n/salario — Registrar salário\n/badges — Ver badges\n/cupom — Ver cupons\n/ajuda — Esta mensagem",
    btnContribute: "✅ Registrar Aporte", btnRanking: "📊 Ver Ranking", btnBadges: "🏆 Badges",
    error: "❌ Erro", notFound: "Grupo não encontrado", memberNotFound: "Membro não encontrado",
  },
  en: {
    ranking: "Ranking", progress: "Progress", daysLeft: "{n} days left", ofSalary: "of salary",
    groupCreated: "✅ Group created!", goal: "Goal", deadline: "Deadline", inviteCode: "Invite code",
    contributionAdded: "✅ Contribution registered!", total: "Total", of: "of",
    salaryRegistered: "✅ Salary privately registered.",
    competitionStarted: "🏆 Competition mode activated!",
    champion: "Champion 👑", lastPlace: "Come on, you got this! 💪",
    badges: "Badges", noBadges: "No badges yet.",
    coupons: "Available coupons", noCoupons: "No coupons available.",
    help: "📋 *Commands:*\n/create\\_goal — Create group\n/contribute — Register contribution\n/ranking — View ranking\n/progress — View progress\n/competition — Activate competition\n/salary — Register salary\n/badges — View badges\n/coupon — View coupons\n/help — This message",
    btnContribute: "✅ Register Contribution", btnRanking: "📊 View Ranking", btnBadges: "🏆 Badges",
    error: "❌ Error", notFound: "Group not found", memberNotFound: "Member not found",
  },
  fr: {
    ranking: "Classement", progress: "Progression", daysLeft: "Il reste {n} jours", ofSalary: "du salaire",
    groupCreated: "✅ Groupe créé !", goal: "Objectif", deadline: "Échéance", inviteCode: "Code d'invitation",
    contributionAdded: "✅ Contribution enregistrée !", total: "Total", of: "de",
    salaryRegistered: "✅ Salaire enregistré de manière privée.",
    competitionStarted: "🏆 Mode compétition activé !",
    champion: "Championne 👑", lastPlace: "Allez, tu peux ! 💪",
    badges: "Badges", noBadges: "Aucun badge.",
    coupons: "Coupons disponibles", noCoupons: "Aucun coupon disponible.",
    help: "📋 *Commandes :*\n/créer\\_objectif — Créer un groupe\n/contribuer — Enregistrer contribution\n/classement — Voir classement\n/progression — Voir progression\n/compétition — Activer compétition\n/salaire — Enregistrer salaire\n/badges — Voir badges\n/coupon — Voir coupons\n/aide — Ce message",
    btnContribute: "✅ Enregistrer", btnRanking: "📊 Classement", btnBadges: "🏆 Badges",
    error: "❌ Erreur", notFound: "Groupe introuvable", memberNotFound: "Membre introuvable",
  },
  es: {
    ranking: "Ranking", progress: "Progreso", daysLeft: "Faltan {n} días", ofSalary: "del salario",
    groupCreated: "✅ ¡Grupo creado!", goal: "Meta", deadline: "Fecha límite", inviteCode: "Código de invitación",
    contributionAdded: "✅ ¡Aporte registrado!", total: "Total", of: "de",
    salaryRegistered: "✅ Tu salario ha sido registrado de forma privada.",
    competitionStarted: "🏆 ¡Modo competencia activado!",
    champion: "Campeona 👑", lastPlace: "¡Vamos, tú puedes! 💪",
    badges: "Badges", noBadges: "Ningún badge aún.",
    coupons: "Cupones disponibles", noCoupons: "Ningún cupón disponible.",
    help: "📋 *Comandos:*\n/crear\\_meta — Crear grupo\n/aportar — Registrar aporte\n/ranking — Ver ranking\n/progreso — Ver progreso\n/competencia — Activar competencia\n/salario — Registrar salario\n/badges — Ver badges\n/cupón — Ver cupones\n/ayuda — Este mensaje",
    btnContribute: "✅ Registrar Aporte", btnRanking: "📊 Ver Ranking", btnBadges: "🏆 Badges",
    error: "❌ Error", notFound: "Grupo no encontrado", memberNotFound: "Miembro no encontrado",
  },
};

type Lang = keyof typeof t;
function getLang(lang: string): Lang { return lang in t ? lang as Lang : "en"; }
function progressBar(pct: number): string { const f = Math.round(pct / 10); return "█".repeat(f) + "░".repeat(10 - f) + ` ${Math.round(pct)}%`; }
function daysUntil(d: string): number { return Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)); }
function formatAmount(a: number, c: string): string { const m: Record<string, string> = { BRL: "R$", CAD: "CA$", USD: "US$", EUR: "€" }; return `${m[c] || c}${a.toLocaleString("en", { maximumFractionDigits: 0 })}`; }
function rankEmoji(p: number): string { return p === 1 ? "👑" : p === 2 ? "🥈" : p === 3 ? "🥉" : "💪"; }

function getSupabaseAdmin() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

// Build Telegram inline keyboard
function inlineKeyboard(lang: Lang) {
  const tr = t[lang];
  return {
    inline_keyboard: [
      [{ text: tr.btnContribute, callback_data: "contribute" }, { text: tr.btnRanking, callback_data: "ranking" }],
      [{ text: tr.btnBadges, callback_data: "badges" }],
    ],
  };
}

async function handleGroupCreate(body: any) {
  const sb = getSupabaseAdmin();
  const { group_telegram_id, goal_name, target_amount, currency, deadline, creator_username } = body;

  const { data: userLink } = await sb.from("bot_user_links").select("user_id").eq("platform", PLATFORM).eq("platform_identifier", creator_username).single();
  if (!userLink) return { error: "User not linked", status: 404 };

  const { data: profile } = await sb.from("profiles").select("language").eq("id", userLink.user_id).single();
  const lang = getLang(profile?.language || "en");
  const tr = t[lang];

  const { data: result } = await sb.rpc("create_group_with_admin", { group_name: goal_name, group_goal_amount: target_amount, group_type: "shared", group_category: "other" });
  const parsed = result as any;
  if (!parsed?.success) return { error: parsed?.error || "Failed", status: 400 };

  await sb.from("bot_group_links").insert({ group_id: parsed.group_id, platform: PLATFORM, platform_group_id: group_telegram_id, language: lang });
  if (deadline) await sb.from("groups").update({ competition_end_date: deadline }).eq("id", parsed.group_id);

  const days = deadline ? daysUntil(deadline) : null;
  const cur = currency || "USD";

  return {
    text: `${tr.groupCreated}\n\n📌 *${goal_name}*\n🎯 ${tr.goal}: ${formatAmount(target_amount, cur)}\n${deadline ? `📅 ${tr.deadline}: ${deadline}\n⏳ ${tr.daysLeft.replace("{n}", String(days))}` : ""}\n🔑 ${tr.inviteCode}: \`${parsed.invite_code}\`\n\n📊 ${progressBar(0)}`,
    parse_mode: "Markdown",
    reply_markup: inlineKeyboard(lang),
  };
}

async function handleContribution(body: any) {
  const sb = getSupabaseAdmin();
  const { group_telegram_id, member_username, amount } = body;

  const { data: link } = await sb.from("bot_group_links").select("group_id, language").eq("platform", PLATFORM).eq("platform_group_id", group_telegram_id).single();
  if (!link) return { error: "Group not linked", status: 404 };

  const lang = getLang(link.language);
  const tr = t[lang];

  const { data: userLink } = await sb.from("bot_user_links").select("user_id").eq("platform", PLATFORM).eq("platform_identifier", member_username).single();
  if (!userLink) return { error: tr.memberNotFound, status: 404 };

  await sb.from("contributions").insert({ group_id: link.group_id, user_id: userLink.user_id, amount, type: "deposit", note: "Via Telegram bot" });

  const { data: group } = await sb.from("groups").select("*").eq("id", link.group_id).single();
  const { data: contribs } = await sb.from("contributions").select("amount, type").eq("group_id", link.group_id);
  const total = (contribs || []).reduce((s: number, c: any) => c.type === "deposit" ? s + Number(c.amount) : s - Number(c.amount), 0);
  const pct = group?.goal_amount > 0 ? (total / group.goal_amount) * 100 : 0;

  return {
    text: `${tr.contributionAdded}\n\n📊 ${progressBar(Math.min(100, pct))} — ${formatAmount(total, "USD")} ${tr.of} ${formatAmount(group?.goal_amount || 0, "USD")}`,
    parse_mode: "Markdown",
    reply_markup: inlineKeyboard(lang),
  };
}

async function handleRanking(groupPlatformId: string) {
  const sb = getSupabaseAdmin();
  const { data: link } = await sb.from("bot_group_links").select("group_id, language").eq("platform", PLATFORM).eq("platform_group_id", groupPlatformId).single();
  if (!link) return { error: "Group not linked", status: 404 };

  const lang = getLang(link.language);
  const tr = t[lang];

  const { data: group } = await sb.from("groups").select("*").eq("id", link.group_id).single();
  const { data: memberships } = await sb.from("group_memberships").select("user_id, salary, show_amount").eq("group_id", link.group_id);
  const { data: contributions } = await sb.from("contributions").select("user_id, amount, type").eq("group_id", link.group_id);

  const totals: Record<string, number> = {};
  for (const c of contributions || []) {
    if (!totals[c.user_id]) totals[c.user_id] = 0;
    totals[c.user_id] += c.type === "deposit" ? Number(c.amount) : -Number(c.amount);
  }

  const ranked = (memberships || []).map((m: any) => {
    const total = totals[m.user_id] || 0;
    const pct = m.salary > 0 ? (total / m.salary) * 100 : null;
    return { user_id: m.user_id, total, salary_pct: pct, show_amount: m.show_amount };
  });

  if (group?.is_open_goal) ranked.sort((a, b) => (b.salary_pct ?? 0) - (a.salary_pct ?? 0));
  else ranked.sort((a, b) => b.total - a.total);

  const userIds = ranked.map((r) => r.user_id);
  const { data: profiles } = await sb.from("profiles").select("id, name").in("id", userIds);
  const names: Record<string, string> = {};
  for (const p of profiles || []) names[p.id] = p.name;

  const totalSaved = Object.values(totals).reduce((a, b) => a + b, 0);
  const goalPct = group?.goal_amount > 0 ? (totalSaved / group.goal_amount) * 100 : 0;

  let text = `🏆 *${tr.ranking} — ${group?.name}*\n\n`;
  ranked.forEach((r, i) => {
    const pos = i + 1;
    const name = names[r.user_id] || "?";
    const emoji = rankEmoji(pos);
    const sal = r.salary_pct !== null ? ` (${Math.round(r.salary_pct)}% ${tr.ofSalary})` : "";
    const amt = r.show_amount ? ` — ${formatAmount(r.total, "USD")}` : "";
    text += `${pos}º ${emoji} ${name}${amt}${sal}\n`;
  });

  if (!group?.is_open_goal) {
    text += `\n📊 ${progressBar(Math.min(100, goalPct))} — ${formatAmount(totalSaved, "USD")} ${tr.of} ${formatAmount(group?.goal_amount || 0, "USD")}`;
    if (group?.competition_end_date) text += `\n📅 ${tr.daysLeft.replace("{n}", String(daysUntil(group.competition_end_date)))}`;
  }

  text += `\n\n👉 billi.app`;
  return { text, parse_mode: "Markdown", reply_markup: inlineKeyboard(lang) };
}

async function handleProgress(groupPlatformId: string) {
  const sb = getSupabaseAdmin();
  const { data: link } = await sb.from("bot_group_links").select("group_id, language").eq("platform", PLATFORM).eq("platform_group_id", groupPlatformId).single();
  if (!link) return { error: "Group not linked", status: 404 };

  const lang = getLang(link.language);
  const tr = t[lang];

  const { data: group } = await sb.from("groups").select("*").eq("id", link.group_id).single();
  const { data: contribs } = await sb.from("contributions").select("amount, type").eq("group_id", link.group_id);
  const total = (contribs || []).reduce((s: number, c: any) => c.type === "deposit" ? s + Number(c.amount) : s - Number(c.amount), 0);
  const pct = group?.goal_amount > 0 ? (total / group.goal_amount) * 100 : 0;

  let text = `📊 *${tr.progress} — ${group?.name}*\n\n${progressBar(Math.min(100, pct))} — ${formatAmount(total, "USD")} ${tr.of} ${formatAmount(group?.goal_amount || 0, "USD")}`;
  if (group?.competition_end_date) text += `\n📅 ${tr.daysLeft.replace("{n}", String(daysUntil(group.competition_end_date)))}`;
  text += `\n\n👉 billi.app`;

  return { text, parse_mode: "Markdown" };
}

async function handleBadges(memberUsername: string) {
  const sb = getSupabaseAdmin();
  const { data: userLink } = await sb.from("bot_user_links").select("user_id").eq("platform", PLATFORM).eq("platform_identifier", memberUsername).single();
  if (!userLink) return { error: "User not linked", status: 404 };

  const { data: profile } = await sb.from("profiles").select("*").eq("id", userLink.user_id).single();
  const lang = getLang(profile?.language || "en");
  const tr = t[lang];

  const badges: string[] = [];
  if (profile) {
    if ((profile.total_contributions || 0) >= 1) badges.push("🥇");
    if ((profile.current_streak || 0) >= 90) badges.push("🔥");
    if ((profile.level || 0) >= 10) badges.push("🏆");
  }

  return { text: badges.length ? `*${tr.badges}*\n\n${badges.join(" ")}` : `*${tr.badges}*\n\n${tr.noBadges}`, parse_mode: "Markdown" };
}

async function handleCoupon(memberUsername: string) {
  const sb = getSupabaseAdmin();
  const { data: userLink } = await sb.from("bot_user_links").select("user_id").eq("platform", PLATFORM).eq("platform_identifier", memberUsername).single();
  if (!userLink) return { error: "User not linked", status: 404 };

  const { data: profile } = await sb.from("profiles").select("language").eq("id", userLink.user_id).single();
  const lang = getLang(profile?.language || "en");
  const tr = t[lang];

  const { data: coupons } = await sb.from("partner_coupons").select("code, description, discount_percentage, discount_amount").eq("is_active", true).limit(5);
  if (!coupons?.length) return { text: `*${tr.coupons}*\n\n${tr.noCoupons}`, parse_mode: "Markdown" };

  let text = `🎟️ *${tr.coupons}*\n\n`;
  for (const c of coupons) {
    const disc = c.discount_percentage ? `${c.discount_percentage}% OFF` : c.discount_amount ? `$${c.discount_amount} OFF` : "";
    text += `• \`${c.code}\` — ${c.description} ${disc}\n`;
  }
  return { text, parse_mode: "Markdown" };
}

async function handleRegisterSalary(body: any) {
  const sb = getSupabaseAdmin();
  const { member_username, salary, group_telegram_id } = body;

  const { data: userLink } = await sb.from("bot_user_links").select("user_id").eq("platform", PLATFORM).eq("platform_identifier", member_username).single();
  if (!userLink) return { error: "User not linked", status: 404 };

  let lang: Lang = "en";
  if (group_telegram_id) {
    const { data: link } = await sb.from("bot_group_links").select("language").eq("platform", PLATFORM).eq("platform_group_id", group_telegram_id).single();
    if (link) lang = getLang(link.language);
  }

  await sb.from("group_memberships").update({ salary }).eq("user_id", userLink.user_id);
  return { text: t[lang].salaryRegistered, parse_mode: "Markdown" };
}

async function handleCompetitionStart(body: any) {
  const sb = getSupabaseAdmin();
  const { group_telegram_id } = body;

  const { data: link } = await sb.from("bot_group_links").select("group_id, language").eq("platform", PLATFORM).eq("platform_group_id", group_telegram_id).single();
  if (!link) return { error: "Group not linked", status: 404 };

  await sb.from("groups").update({ is_open_goal: true }).eq("id", link.group_id);
  const lang = getLang(link.language);
  return { text: t[lang].competitionStarted, parse_mode: "Markdown", reply_markup: inlineKeyboard(lang) };
}

// ===== MAIN =====
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/telegram-bot\/?/, "");
    let result: any;

    if (req.method === "POST") {
      const body = await req.json();
      if (path.includes("group-create")) result = await handleGroupCreate(body);
      else if (path.includes("contribution")) result = await handleContribution(body);
      else if (path.includes("register-salary")) result = await handleRegisterSalary(body);
      else if (path.includes("competition/start")) result = await handleCompetitionStart(body);
      else result = { error: "Unknown endpoint", status: 404 };
    } else if (req.method === "GET") {
      const parts = path.split("/");
      if (parts[0] === "ranking" && parts[1]) result = await handleRanking(parts[1]);
      else if (parts[0] === "progress" && parts[1]) result = await handleProgress(parts[1]);
      else if (parts[0] === "badges" && parts[1]) result = await handleBadges(parts[1]);
      else if (parts[0] === "coupon" && parts[1]) result = await handleCoupon(parts[1]);
      else result = { error: "Unknown endpoint", status: 404 };
    }

    const status = result?.status || (result?.error ? 400 : 200);
    return new Response(JSON.stringify(result), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
