import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLATFORM = "whatsapp";

// ===== TRANSLATIONS =====
const t = {
  pt: {
    ranking: "Ranking",
    progress: "Progresso",
    daysLeft: "Faltam {n} dias",
    ofSalary: "do salário",
    groupCreated: "✅ Grupo criado com sucesso!",
    goal: "Meta",
    deadline: "Prazo",
    inviteCode: "Código de convite",
    contributionAdded: "✅ Aporte registrado!",
    total: "Total",
    of: "de",
    salaryRegistered: "✅ Seu salário foi registrado de forma privada.",
    competitionStarted: "🏆 Modo competição ativado!",
    champion: "Campeã 👑",
    lastPlace: "Vai que vai! 💪",
    badges: "Badges",
    noBadges: "Nenhum badge ainda. Continue poupando!",
    coupons: "Cupons disponíveis",
    noCoupons: "Nenhum cupom disponível ainda.",
    help: "📋 *Comandos Billi WhatsApp*\n\n/ativar [telefone] — Vincular conta\n/aporte [valor] — Registrar aporte\n/ranking — Ver ranking do grupo\n/progresso — Ver progresso\n/salario [valor] — Registrar salário\n/badges — Ver badges\n/cupom — Ver cupons\n/ajuda — Esta mensagem\n\n💡 Primeiro vincule sua conta com /ativar",
    error: "❌ Erro",
    notFound: "Grupo não encontrado",
    memberNotFound: "Membro não encontrado",
    activated: "✅ Conta vinculada com sucesso! Agora você pode usar o Billi pelo WhatsApp.",
    alreadyActivated: "✅ Sua conta já está vinculada!",
    phoneNotFound: "❌ Nenhuma conta encontrada com esse telefone. Cadastre-se em bebilli.lovable.app primeiro.",
    activateFirst: "⚠️ Vincule sua conta primeiro enviando:\n/ativar +5511999999999",
    welcome: "👋 Olá! Eu sou a *Billi* 🐝\nSeu assistente de economia!\n\nEnvie /ajuda para ver os comandos.",
    unknownCommand: "🤔 Não entendi. Envie /ajuda para ver os comandos disponíveis.",
  },
  en: {
    ranking: "Ranking",
    progress: "Progress",
    daysLeft: "{n} days left",
    ofSalary: "of salary",
    groupCreated: "✅ Group created successfully!",
    goal: "Goal",
    deadline: "Deadline",
    inviteCode: "Invite code",
    contributionAdded: "✅ Contribution registered!",
    total: "Total",
    of: "of",
    salaryRegistered: "✅ Your salary has been privately registered.",
    competitionStarted: "🏆 Competition mode activated!",
    champion: "Champion 👑",
    lastPlace: "Come on, you got this! 💪",
    badges: "Badges",
    noBadges: "No badges yet. Keep saving!",
    coupons: "Available coupons",
    noCoupons: "No coupons available yet.",
    help: "📋 *Billi WhatsApp Commands*\n\n/activate [phone] — Link account\n/contribute [amount] — Register contribution\n/ranking — View ranking\n/progress — View progress\n/salary [amount] — Register salary\n/badges — View badges\n/coupon — View coupons\n/help — This message\n\n💡 First link your account with /activate",
    error: "❌ Error",
    notFound: "Group not found",
    memberNotFound: "Member not found",
    activated: "✅ Account linked successfully! You can now use Billi via WhatsApp.",
    alreadyActivated: "✅ Your account is already linked!",
    phoneNotFound: "❌ No account found with that phone number. Sign up at bebilli.lovable.app first.",
    activateFirst: "⚠️ Link your account first by sending:\n/activate +1234567890",
    welcome: "👋 Hi! I'm *Billi* 🐝\nYour savings assistant!\n\nSend /help to see commands.",
    unknownCommand: "🤔 I didn't understand. Send /help to see available commands.",
  },
  fr: {
    ranking: "Classement",
    progress: "Progression",
    daysLeft: "Il reste {n} jours",
    ofSalary: "du salaire",
    groupCreated: "✅ Groupe créé avec succès !",
    goal: "Objectif",
    deadline: "Échéance",
    inviteCode: "Code d'invitation",
    contributionAdded: "✅ Contribution enregistrée !",
    total: "Total",
    of: "de",
    salaryRegistered: "✅ Votre salaire a été enregistré.",
    competitionStarted: "🏆 Mode compétition activé !",
    champion: "Championne 👑",
    lastPlace: "Allez, tu peux ! 💪",
    badges: "Badges",
    noBadges: "Aucun badge pour l'instant.",
    coupons: "Coupons disponibles",
    noCoupons: "Aucun coupon disponible.",
    help: "📋 *Commandes Billi WhatsApp*\n\n/activer [tel] — Lier compte\n/contribuer [montant] — Contribution\n/classement — Classement\n/progression — Progression\n/salaire [montant] — Salaire\n/badges — Badges\n/coupon — Coupons\n/aide — Aide",
    error: "❌ Erreur",
    notFound: "Groupe introuvable",
    memberNotFound: "Membre introuvable",
    activated: "✅ Compte lié avec succès !",
    alreadyActivated: "✅ Votre compte est déjà lié !",
    phoneNotFound: "❌ Aucun compte trouvé. Inscrivez-vous sur bebilli.lovable.app.",
    activateFirst: "⚠️ Liez votre compte d'abord :\n/activer +33612345678",
    welcome: "👋 Bonjour ! Je suis *Billi* 🐝\nVotre assistant épargne !\n\nEnvoyez /aide pour les commandes.",
    unknownCommand: "🤔 Je n'ai pas compris. Envoyez /aide pour les commandes.",
  },
  es: {
    ranking: "Ranking",
    progress: "Progreso",
    daysLeft: "Faltan {n} días",
    ofSalary: "del salario",
    groupCreated: "✅ ¡Grupo creado!",
    goal: "Meta",
    deadline: "Fecha límite",
    inviteCode: "Código de invitación",
    contributionAdded: "✅ ¡Aporte registrado!",
    total: "Total",
    of: "de",
    salaryRegistered: "✅ Tu salario ha sido registrado.",
    competitionStarted: "🏆 ¡Modo competencia activado!",
    champion: "Campeona 👑",
    lastPlace: "¡Vamos! 💪",
    badges: "Badges",
    noBadges: "Ningún badge aún.",
    coupons: "Cupones disponibles",
    noCoupons: "Ningún cupón disponible.",
    help: "📋 *Comandos Billi WhatsApp*\n\n/activar [tel] — Vincular cuenta\n/aportar [monto] — Aporte\n/ranking — Ranking\n/progreso — Progreso\n/salario [monto] — Salario\n/badges — Badges\n/cupón — Cupones\n/ayuda — Ayuda",
    error: "❌ Error",
    notFound: "Grupo no encontrado",
    memberNotFound: "Miembro no encontrado",
    activated: "✅ ¡Cuenta vinculada!",
    alreadyActivated: "✅ ¡Tu cuenta ya está vinculada!",
    phoneNotFound: "❌ No se encontró cuenta. Regístrate en bebilli.lovable.app.",
    activateFirst: "⚠️ Vincula tu cuenta primero:\n/activar +34612345678",
    welcome: "👋 ¡Hola! Soy *Billi* 🐝\n¡Tu asistente de ahorro!\n\nEnvía /ayuda para ver comandos.",
    unknownCommand: "🤔 No entendí. Envía /ayuda para ver los comandos.",
  },
};

type Lang = keyof typeof t;

function getLang(lang: string): Lang {
  if (lang in t) return lang as Lang;
  return "en";
}

function progressBar(pct: number): string {
  const filled = Math.round(pct / 10);
  return "█".repeat(filled) + "░".repeat(10 - filled) + ` ${Math.round(pct)}%`;
}

function daysUntil(deadline: string): number {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function currencySymbol(currency: string): string {
  const map: Record<string, string> = { BRL: "R$", CAD: "CA$", USD: "US$", EUR: "€" };
  return map[currency] || currency;
}

function formatAmount(amount: number, currency: string): string {
  return `${currencySymbol(currency)}${amount.toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function rankEmoji(pos: number): string {
  if (pos === 1) return "👑";
  if (pos === 2) return "🥈";
  if (pos === 3) return "🥉";
  return "💪";
}

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

function normalizePhone(phone: string): string {
  let p = phone.replace(/[\s\-\(\)]/g, "");
  if (!p.startsWith("+")) p = "+" + p;
  return p;
}

// ===== WHATSAPP CLOUD API: SEND MESSAGE =====
async function sendWhatsAppMessage(to: string, text: string) {
  const token = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  if (!token) {
    console.error("WHATSAPP_ACCESS_TOKEN not configured");
    return;
  }

  // Get phone_number_id from app_settings
  const sb = getSupabaseAdmin();
  const { data: setting } = await sb
    .from("app_settings")
    .select("value")
    .eq("key", "whatsapp_phone_number_id")
    .single();

  const phoneNumberId = setting?.value;
  if (!phoneNumberId) {
    console.error("WhatsApp phone_number_id not configured in app_settings");
    return;
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body: text },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`WhatsApp API error [${res.status}]: ${err}`);
    }
  } catch (e) {
    console.error("Failed to send WhatsApp message:", e);
  }
}

// ===== Get user lang from phone =====
async function getUserLang(senderPhone: string): Promise<Lang> {
  const sb = getSupabaseAdmin();
  const { data: userLink } = await sb
    .from("bot_user_links")
    .select("user_id")
    .eq("platform", PLATFORM)
    .eq("platform_identifier", normalizePhone(senderPhone))
    .single();

  if (!userLink) return "pt";

  const { data: profile } = await sb
    .from("profiles")
    .select("language")
    .eq("id", userLink.user_id)
    .single();

  return getLang(profile?.language || "pt");
}

// ===== Get user's first group =====
async function getUserFirstGroup(userId: string) {
  const sb = getSupabaseAdmin();
  const { data: membership } = await sb
    .from("group_memberships")
    .select("group_id")
    .eq("user_id", userId)
    .limit(1)
    .single();

  return membership?.group_id || null;
}

// ===== COMMAND HANDLERS =====

async function handleActivate(senderPhone: string, args: string): Promise<string> {
  const sb = getSupabaseAdmin();
  const normalizedSender = normalizePhone(senderPhone);

  // Check if already linked
  const { data: existing } = await sb
    .from("bot_user_links")
    .select("user_id")
    .eq("platform", PLATFORM)
    .eq("platform_identifier", normalizedSender)
    .single();

  if (existing) {
    const { data: profile } = await sb.from("profiles").select("language").eq("id", existing.user_id).single();
    return t[getLang(profile?.language || "pt")].alreadyActivated;
  }

  // The phone to match: use declared phone if provided, otherwise sender's phone
  const declaredPhone = args.trim() || senderPhone;
  const phoneToMatch = normalizePhone(declaredPhone);

  // Try to find profile by phone
  let profile = null;
  const { data: p1 } = await sb.from("profiles").select("id, language, phone").eq("phone", phoneToMatch).single();
  profile = p1;

  if (!profile) {
    const altPhone = phoneToMatch.startsWith("+") ? phoneToMatch.slice(1) : "+" + phoneToMatch;
    const { data: p2 } = await sb.from("profiles").select("id, language, phone").eq("phone", altPhone).single();
    profile = p2;
  }

  if (!profile) {
    // Also try matching whatsapp_number
    const { data: p3 } = await sb.from("profiles").select("id, language, phone").eq("whatsapp_number", phoneToMatch).single();
    profile = p3;
  }

  if (!profile) {
    return t.pt.phoneNotFound;
  }

  // Link the account
  await sb.from("bot_user_links").insert({
    user_id: profile.id,
    platform: PLATFORM,
    platform_identifier: normalizedSender,
  });

  await sb.from("profiles").update({ whatsapp_number: normalizedSender }).eq("id", profile.id);

  return t[getLang(profile.language || "pt")].activated;
}

async function handleContribution(senderPhone: string, args: string): Promise<string> {
  const sb = getSupabaseAdmin();
  const normalizedSender = normalizePhone(senderPhone);

  const { data: userLink } = await sb.from("bot_user_links").select("user_id").eq("platform", PLATFORM).eq("platform_identifier", normalizedSender).single();
  if (!userLink) return t.pt.activateFirst;

  const { data: profile } = await sb.from("profiles").select("language, currency").eq("id", userLink.user_id).single();
  const lang = getLang(profile?.language || "pt");
  const tr = t[lang];
  const cur = profile?.currency || "CAD";

  const amount = parseFloat(args.replace(/[^0-9.,]/g, "").replace(",", "."));
  if (!amount || amount <= 0) {
    return `${tr.error}: envie /aporte 100 (ou /contribute 100)`;
  }

  const groupId = await getUserFirstGroup(userLink.user_id);
  if (!groupId) {
    return `${tr.error}: ${tr.notFound}`;
  }

  await sb.from("contributions").insert({
    group_id: groupId,
    user_id: userLink.user_id,
    amount,
    type: "deposit",
    note: "Via WhatsApp",
    source: "whatsapp",
  });

  // Get updated progress
  const { data: group } = await sb.from("groups").select("goal_amount, name").eq("id", groupId).single();
  const { data: contribs } = await sb.from("contributions").select("amount, type").eq("group_id", groupId);
  const totalSaved = (contribs || []).reduce((sum: number, c: any) => c.type === "deposit" ? sum + Number(c.amount) : sum - Number(c.amount), 0);
  const pct = group?.goal_amount && group.goal_amount > 0 ? (totalSaved / group.goal_amount) * 100 : 0;

  return `${tr.contributionAdded}\n💰 ${formatAmount(amount, cur)}\n\n📊 ${group?.name}\n${progressBar(Math.min(100, pct))} — ${formatAmount(totalSaved, cur)} ${tr.of} ${formatAmount(group?.goal_amount || 0, cur)}`;
}

async function handleRanking(senderPhone: string): Promise<string> {
  const sb = getSupabaseAdmin();
  const normalizedSender = normalizePhone(senderPhone);

  const { data: userLink } = await sb.from("bot_user_links").select("user_id").eq("platform", PLATFORM).eq("platform_identifier", normalizedSender).single();
  if (!userLink) return t.pt.activateFirst;

  const { data: profile } = await sb.from("profiles").select("language, currency").eq("id", userLink.user_id).single();
  const lang = getLang(profile?.language || "pt");
  const tr = t[lang];
  const cur = profile?.currency || "CAD";

  const groupId = await getUserFirstGroup(userLink.user_id);
  if (!groupId) return `${tr.error}: ${tr.notFound}`;

  const { data: group } = await sb.from("groups").select("*").eq("id", groupId).single();
  const { data: memberships } = await sb.from("group_memberships").select("user_id, salary, show_amount").eq("group_id", groupId);
  const { data: contributions } = await sb.from("contributions").select("user_id, amount, type").eq("group_id", groupId);

  const memberTotals: Record<string, number> = {};
  for (const c of contributions || []) {
    if (!memberTotals[c.user_id]) memberTotals[c.user_id] = 0;
    memberTotals[c.user_id] += c.type === "deposit" ? Number(c.amount) : -Number(c.amount);
  }

  const ranked = (memberships || []).map((m: any) => {
    const total = memberTotals[m.user_id] || 0;
    const pct = m.salary && m.salary > 0 ? (total / m.salary) * 100 : null;
    return { user_id: m.user_id, total, salary_pct: pct, show_amount: m.show_amount };
  });

  if (group?.is_open_goal) {
    ranked.sort((a, b) => (b.salary_pct ?? 0) - (a.salary_pct ?? 0));
  } else {
    ranked.sort((a, b) => b.total - a.total);
  }

  const userIds = ranked.map((r) => r.user_id);
  const { data: profiles } = await sb.from("profiles").select("id, name").in("id", userIds);
  const nameMap: Record<string, string> = {};
  for (const p of profiles || []) nameMap[p.id] = p.name;

  const totalSaved = Object.values(memberTotals).reduce((a, b) => a + b, 0);
  const pct = group?.goal_amount > 0 ? (totalSaved / group.goal_amount) * 100 : 0;

  let text = `🏆 ${tr.ranking} — ${group?.name}\n\n`;
  ranked.forEach((r, i) => {
    const pos = i + 1;
    const name = nameMap[r.user_id] || "?";
    const emoji = rankEmoji(pos);
    const salaryStr = r.salary_pct !== null ? ` (${Math.round(r.salary_pct)}% ${tr.ofSalary})` : "";
    const amountStr = r.show_amount ? ` — ${formatAmount(r.total, cur)}` : "";
    text += `${pos}º ${emoji} ${name}${amountStr}${salaryStr}\n`;
  });

  if (!group?.is_open_goal) {
    text += `\n📊 ${progressBar(Math.min(100, pct))} — ${formatAmount(totalSaved, cur)} ${tr.of} ${formatAmount(group?.goal_amount || 0, cur)}`;
  }

  text += `\n\n👉 bebilli.lovable.app`;
  return text;
}

async function handleProgress(senderPhone: string): Promise<string> {
  const sb = getSupabaseAdmin();
  const normalizedSender = normalizePhone(senderPhone);

  const { data: userLink } = await sb.from("bot_user_links").select("user_id").eq("platform", PLATFORM).eq("platform_identifier", normalizedSender).single();
  if (!userLink) return t.pt.activateFirst;

  const { data: profile } = await sb.from("profiles").select("language, currency").eq("id", userLink.user_id).single();
  const lang = getLang(profile?.language || "pt");
  const tr = t[lang];
  const cur = profile?.currency || "CAD";

  const groupId = await getUserFirstGroup(userLink.user_id);
  if (!groupId) return `${tr.error}: ${tr.notFound}`;

  const { data: group } = await sb.from("groups").select("*").eq("id", groupId).single();
  const { data: contributions } = await sb.from("contributions").select("amount, type").eq("group_id", groupId);

  const totalSaved = (contributions || []).reduce((sum: number, c: any) => c.type === "deposit" ? sum + Number(c.amount) : sum - Number(c.amount), 0);
  const pct = group?.goal_amount > 0 ? (totalSaved / group.goal_amount) * 100 : 0;

  let text = `📊 ${tr.progress} — ${group?.name}\n\n${progressBar(Math.min(100, pct))} — ${formatAmount(totalSaved, cur)} ${tr.of} ${formatAmount(group?.goal_amount || 0, cur)}`;

  if (group?.competition_end_date) {
    const days = daysUntil(group.competition_end_date);
    text += `\n📅 ${tr.daysLeft.replace("{n}", String(days))}`;
  }

  text += `\n\n👉 bebilli.lovable.app`;
  return text;
}

async function handleSalary(senderPhone: string, args: string): Promise<string> {
  const sb = getSupabaseAdmin();
  const normalizedSender = normalizePhone(senderPhone);

  const { data: userLink } = await sb.from("bot_user_links").select("user_id").eq("platform", PLATFORM).eq("platform_identifier", normalizedSender).single();
  if (!userLink) return t.pt.activateFirst;

  const { data: profile } = await sb.from("profiles").select("language").eq("id", userLink.user_id).single();
  const lang = getLang(profile?.language || "pt");

  const salary = parseFloat(args.replace(/[^0-9.,]/g, "").replace(",", "."));
  if (!salary || salary <= 0) {
    return `${t[lang].error}: envie /salario 5000`;
  }

  await sb.from("group_memberships").update({ salary }).eq("user_id", userLink.user_id);
  return t[lang].salaryRegistered;
}

async function handleBadges(senderPhone: string): Promise<string> {
  const sb = getSupabaseAdmin();
  const normalizedSender = normalizePhone(senderPhone);

  const { data: userLink } = await sb.from("bot_user_links").select("user_id").eq("platform", PLATFORM).eq("platform_identifier", normalizedSender).single();
  if (!userLink) return t.pt.activateFirst;

  const { data: profile } = await sb.from("profiles").select("*").eq("id", userLink.user_id).single();
  const lang = getLang(profile?.language || "pt");
  const tr = t[lang];

  const badges: string[] = [];
  if (profile) {
    if ((profile.total_contributions || 0) >= 1) badges.push("🥇 Primeiro aporte");
    if ((profile.current_streak || 0) >= 7) badges.push("🔥 7 dias seguidos");
    if ((profile.current_streak || 0) >= 30) badges.push("⚡ 30 dias seguidos");
    if ((profile.current_streak || 0) >= 90) badges.push("💎 90 dias seguidos");
    if ((profile.level || 0) >= 5) badges.push("⭐ Nível 5");
    if ((profile.level || 0) >= 10) badges.push("🏆 Nível 10");
    if ((profile.best_streak || 0) >= 365) badges.push("🌟 1 ano de streak");
  }

  if (badges.length === 0) return `${tr.badges}\n\n${tr.noBadges}`;
  return `${tr.badges}\n\n${badges.join("\n")}`;
}

async function handleCoupon(senderPhone: string): Promise<string> {
  const sb = getSupabaseAdmin();
  const normalizedSender = normalizePhone(senderPhone);

  const { data: userLink } = await sb.from("bot_user_links").select("user_id").eq("platform", PLATFORM).eq("platform_identifier", normalizedSender).single();
  if (!userLink) return t.pt.activateFirst;

  const { data: profile } = await sb.from("profiles").select("language").eq("id", userLink.user_id).single();
  const lang = getLang(profile?.language || "pt");
  const tr = t[lang];

  const { data: coupons } = await sb.from("partner_coupons").select("code, description, discount_percentage, discount_amount").eq("is_active", true).limit(5);

  if (!coupons?.length) return `${tr.coupons}\n\n${tr.noCoupons}`;

  let text = `🎟️ ${tr.coupons}\n\n`;
  for (const c of coupons) {
    const disc = c.discount_percentage ? `${c.discount_percentage}% OFF` : c.discount_amount ? `$${c.discount_amount} OFF` : "";
    text += `• *${c.code}* — ${c.description} ${disc}\n`;
  }
  return text;
}

// ===== COMMAND ALIASES (multi-language) =====
const COMMAND_MAP: Record<string, string> = {
  // Portuguese
  "/ativar": "activate",
  "/aporte": "contribute",
  "/ranking": "ranking",
  "/progresso": "progress",
  "/salario": "salary",
  "/salário": "salary",
  "/badges": "badges",
  "/cupom": "coupon",
  "/ajuda": "help",
  // English
  "/activate": "activate",
  "/contribute": "contribute",
  "/progress": "progress",
  "/salary": "salary",
  "/help": "help",
  "/coupon": "coupon",
  // French
  "/activer": "activate",
  "/contribuer": "contribute",
  "/classement": "ranking",
  "/progression": "progress",
  "/salaire": "salary",
  "/aide": "help",
  // Spanish
  "/activar": "activate",
  "/aportar": "contribute",
  "/progreso": "progress",
  "/ayuda": "help",
  "/cupón": "coupon",
};

// ===== PARSE INCOMING MESSAGE & ROUTE =====
async function processMessage(senderPhone: string, messageText: string): Promise<string> {
  const text = messageText.trim();
  const parts = text.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1).join(" ");

  const action = COMMAND_MAP[command];

  switch (action) {
    case "activate":
      return await handleActivate(senderPhone, args);
    case "contribute":
      return await handleContribution(senderPhone, args);
    case "ranking":
      return await handleRanking(senderPhone);
    case "progress":
      return await handleProgress(senderPhone);
    case "salary":
      return await handleSalary(senderPhone, args);
    case "badges":
      return await handleBadges(senderPhone);
    case "coupon":
      return await handleCoupon(senderPhone);
    case "help": {
      const lang = await getUserLang(senderPhone);
      return t[lang].help;
    }
    default: {
      // If message starts with "oi", "hi", "olá", "hello" etc, send welcome
      const greetings = ["oi", "olá", "ola", "hi", "hello", "hola", "bonjour", "hey"];
      if (greetings.includes(command.replace("/", ""))) {
        const lang = await getUserLang(senderPhone);
        return t[lang].welcome;
      }
      const lang = await getUserLang(senderPhone);
      return t[lang].unknownCommand;
    }
  }
}

// ===== MAIN WEBHOOK HANDLER =====
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ===== GET: Webhook Verification (Meta sends this when you register the webhook) =====
    if (req.method === "GET") {
      const url = new URL(req.url);
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      const VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN");

      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Webhook verified successfully");
        return new Response(challenge, { status: 200, headers: corsHeaders });
      } else {
        console.error("Webhook verification failed", { mode, token: token?.slice(0, 4) + "..." });
        return new Response("Forbidden", { status: 403, headers: corsHeaders });
      }
    }

    // ===== POST: Incoming Messages from WhatsApp =====
    if (req.method === "POST") {
      const body = await req.json();

      // WhatsApp Cloud API sends notifications in this structure
      const entry = body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      // Check if it's a message notification (not a status update)
      if (value?.messages && value.messages.length > 0) {
        for (const message of value.messages) {
          // Only handle text messages
          if (message.type === "text" && message.text?.body) {
            const senderPhone = message.from; // e.g. "5511999999999"
            const messageText = message.text.body;

            console.log(`Incoming message from ${senderPhone}: ${messageText}`);

            // Process the command and get reply
            const reply = await processMessage(senderPhone, messageText);

            // Send reply back via WhatsApp API
            await sendWhatsAppMessage(senderPhone, reply);
          }
        }
      }

      // Always return 200 to WhatsApp (they'll retry if not 200)
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  } catch (error) {
    console.error("Webhook error:", error);
    // Still return 200 to prevent WhatsApp from retrying
    return new Response(JSON.stringify({ status: "error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
