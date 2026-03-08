import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    salaryRegistered: "✅ Seu salário foi registrado de forma privada. Ele nunca será compartilhado.",
    competitionStarted: "🏆 Modo competição ativado! Reset todo dia 1º do mês.",
    champion: "Campeã 👑",
    lastPlace: "Vai que vai! 💪",
    badges: "Badges",
    noBadges: "Nenhum badge ainda. Continue poupando!",
    coupons: "Cupons disponíveis",
    noCoupons: "Nenhum cupom disponível ainda.",
    help: "📋 Comandos disponíveis:\n/ativar [telefone] — Vincular conta\n/criar meta — Criar grupo\n/aporte — Registrar aporte\n/ranking — Ver ranking\n/progresso — Ver progresso\n/competição — Ativar competição\n/salario — Registrar salário\n/badges — Ver badges\n/cupom — Ver cupons\n/ajuda — Esta mensagem",
    error: "❌ Erro",
    notFound: "Grupo não encontrado",
    memberNotFound: "Membro não encontrado",
    activated: "✅ Conta vinculada com sucesso! Agora você pode usar o Billi pelo WhatsApp.",
    alreadyActivated: "✅ Sua conta já está vinculada!",
    phoneNotFound: "❌ Nenhuma conta encontrada com esse telefone. Cadastre-se em billi.app primeiro.",
    activateFirst: "⚠️ Vincule sua conta primeiro enviando:\n/ativar +5511999999999",
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
    salaryRegistered: "✅ Your salary has been privately registered. It will never be shared.",
    competitionStarted: "🏆 Competition mode activated! Resets every 1st of month.",
    champion: "Champion 👑",
    lastPlace: "Come on, you got this! 💪",
    badges: "Badges",
    noBadges: "No badges yet. Keep saving!",
    coupons: "Available coupons",
    noCoupons: "No coupons available yet.",
    help: "📋 Available commands:\n/activate [phone] — Link account\n/create goal — Create group\n/contribute — Register contribution\n/ranking — View ranking\n/progress — View progress\n/competition — Activate competition\n/salary — Register salary\n/badges — View badges\n/coupon — View coupons\n/help — This message",
    error: "❌ Error",
    notFound: "Group not found",
    memberNotFound: "Member not found",
    activated: "✅ Account linked successfully! You can now use Billi via WhatsApp.",
    alreadyActivated: "✅ Your account is already linked!",
    phoneNotFound: "❌ No account found with that phone number. Sign up at billi.app first.",
    activateFirst: "⚠️ Link your account first by sending:\n/activate +1234567890",
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
    salaryRegistered: "✅ Votre salaire a été enregistré de manière privée.",
    competitionStarted: "🏆 Mode compétition activé !",
    champion: "Championne 👑",
    lastPlace: "Allez, tu peux ! 💪",
    badges: "Badges",
    noBadges: "Aucun badge pour l'instant.",
    coupons: "Coupons disponibles",
    noCoupons: "Aucun coupon disponible.",
    help: "📋 Commandes :\n/activer [tel] — Lier compte\n/créer objectif — Créer groupe\n/contribuer — Contribution\n/classement — Classement\n/progression — Progression\n/compétition — Compétition\n/salaire — Salaire\n/badges — Badges\n/coupon — Coupons\n/aide — Aide",
    error: "❌ Erreur",
    notFound: "Groupe introuvable",
    memberNotFound: "Membre introuvable",
    activated: "✅ Compte lié avec succès ! Vous pouvez maintenant utiliser Billi via WhatsApp.",
    alreadyActivated: "✅ Votre compte est déjà lié !",
    phoneNotFound: "❌ Aucun compte trouvé avec ce numéro. Inscrivez-vous sur billi.app.",
    activateFirst: "⚠️ Liez votre compte d'abord :\n/activer +33612345678",
  },
  es: {
    ranking: "Ranking",
    progress: "Progreso",
    daysLeft: "Faltan {n} días",
    ofSalary: "del salario",
    groupCreated: "✅ ¡Grupo creado exitosamente!",
    goal: "Meta",
    deadline: "Fecha límite",
    inviteCode: "Código de invitación",
    contributionAdded: "✅ ¡Aporte registrado!",
    total: "Total",
    of: "de",
    salaryRegistered: "✅ Tu salario ha sido registrado de forma privada.",
    competitionStarted: "🏆 ¡Modo competencia activado!",
    champion: "Campeona 👑",
    lastPlace: "¡Vamos, tú puedes! 💪",
    badges: "Badges",
    noBadges: "Ningún badge aún.",
    coupons: "Cupones disponibles",
    noCoupons: "Ningún cupón disponible.",
    help: "📋 Comandos:\n/activar [tel] — Vincular cuenta\n/crear meta — Crear grupo\n/aportar — Aporte\n/ranking — Ranking\n/progreso — Progreso\n/competencia — Competencia\n/salario — Salario\n/badges — Badges\n/cupón — Cupones\n/ayuda — Ayuda",
    error: "❌ Error",
    notFound: "Grupo no encontrado",
    memberNotFound: "Miembro no encontrado",
    activated: "✅ ¡Cuenta vinculada exitosamente! Ahora puedes usar Billi por WhatsApp.",
    alreadyActivated: "✅ ¡Tu cuenta ya está vinculada!",
    phoneNotFound: "❌ No se encontró cuenta con ese teléfono. Regístrate en billi.app primero.",
    activateFirst: "⚠️ Vincula tu cuenta primero:\n/activar +34612345678",
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
  const sym = currencySymbol(currency);
  return `${sym}${amount.toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function rankEmoji(pos: number): string {
  if (pos === 1) return "👑";
  if (pos === 2) return "🥈";
  if (pos === 3) return "🥉";
  return "💪";
}

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key);
}

// Normalize phone: strip spaces, ensure + prefix
function normalizePhone(phone: string): string {
  let p = phone.replace(/[\s\-\(\)]/g, '');
  if (!p.startsWith('+')) p = '+' + p;
  return p;
}

// ===== ACTIVATE / LINK ACCOUNT =====
async function handleActivate(body: any) {
  const sb = getSupabaseAdmin();
  const { whatsapp_phone, declared_phone } = body;
  
  // whatsapp_phone = the sender's WhatsApp number
  // declared_phone = the phone number they declare to link (from their Billi profile)
  const phoneToMatch = normalizePhone(declared_phone || whatsapp_phone);
  
  // Check if already linked
  const { data: existing } = await sb
    .from("bot_user_links")
    .select("user_id")
    .eq("platform", PLATFORM)
    .eq("platform_identifier", normalizePhone(whatsapp_phone))
    .single();
    
  if (existing) {
    const { data: profile } = await sb.from("profiles").select("language").eq("id", existing.user_id).single();
    const lang = getLang(profile?.language || "en");
    return { text: t[lang].alreadyActivated };
  }

  // Find user by phone in profiles
  const { data: profile } = await sb
    .from("profiles")
    .select("id, language, phone")
    .eq("phone", phoneToMatch)
    .single();
    
  if (!profile) {
    // Try without + prefix
    const altPhone = phoneToMatch.startsWith('+') ? phoneToMatch.slice(1) : '+' + phoneToMatch;
    const { data: profileAlt } = await sb
      .from("profiles")
      .select("id, language, phone")
      .eq("phone", altPhone)
      .single();
      
    if (!profileAlt) {
      return { text: t.pt.phoneNotFound }; // Default to Portuguese since we don't know user's lang
    }
    
    // Link found with alt phone
    await sb.from("bot_user_links").insert({
      user_id: profileAlt.id,
      platform: PLATFORM,
      platform_identifier: normalizePhone(whatsapp_phone),
    });
    
    // Also update whatsapp_number on profile
    await sb.from("profiles").update({ whatsapp_number: normalizePhone(whatsapp_phone) }).eq("id", profileAlt.id);
    
    const lang = getLang(profileAlt.language || "en");
    return { text: t[lang].activated };
  }

  // Link the account
  await sb.from("bot_user_links").insert({
    user_id: profile.id,
    platform: PLATFORM,
    platform_identifier: normalizePhone(whatsapp_phone),
  });
  
  // Also update whatsapp_number on profile
  await sb.from("profiles").update({ whatsapp_number: normalizePhone(whatsapp_phone) }).eq("id", profile.id);

  const lang = getLang(profile.language || "en");
  return { text: t[lang].activated };
}

// ===== ROUTE HANDLERS =====

async function handleGroupCreate(body: any) {
  const sb = getSupabaseAdmin();
  const { group_whatsapp_id, goal_name, target_amount, currency, deadline, creator_phone } = body;

  const { data: userLink } = await sb.from("bot_user_links").select("user_id").eq("platform", PLATFORM).eq("platform_identifier", normalizePhone(creator_phone)).single();
  
  if (!userLink) {
    return { error: t.pt.activateFirst, status: 404 };
  }

  const { data: profile } = await sb.from("profiles").select("language").eq("id", userLink.user_id).single();
  const lang = getLang(profile?.language || "en");
  const tr = t[lang];

  const { data: result } = await sb.rpc("create_group_with_admin", {
    group_name: goal_name,
    group_goal_amount: target_amount,
    group_type: "shared",
    group_category: "other",
  });

  const parsed = result as any;
  if (!parsed?.success) {
    return { error: parsed?.error || "Failed to create group", status: 400 };
  }

  await sb.from("bot_group_links").insert({
    group_id: parsed.group_id,
    platform: PLATFORM,
    platform_group_id: group_whatsapp_id,
    language: lang,
  });

  if (deadline) {
    await sb.from("groups").update({ competition_end_date: deadline }).eq("id", parsed.group_id);
  }

  const days = deadline ? daysUntil(deadline) : null;
  const cur = currency || "USD";

  return {
    text: `${tr.groupCreated}\n\n📌 ${goal_name}\n🎯 ${tr.goal}: ${formatAmount(target_amount, cur)}\n${deadline ? `📅 ${tr.deadline}: ${deadline}\n⏳ ${tr.daysLeft.replace("{n}", String(days))}` : ""}\n🔑 ${tr.inviteCode}: ${parsed.invite_code}\n\n📊 ${progressBar(0)} — ${formatAmount(0, cur)} ${tr.of} ${formatAmount(target_amount, cur)}\n\n👉 billi.app`,
  };
}

async function handleContribution(body: any) {
  const sb = getSupabaseAdmin();
  const { group_whatsapp_id, member_phone, amount } = body;

  const { data: link } = await sb.from("bot_group_links").select("group_id, language").eq("platform", PLATFORM).eq("platform_group_id", group_whatsapp_id).single();
  if (!link) return { error: "Group not linked", status: 404 };

  const lang = getLang(link.language);
  const tr = t[lang];

  const { data: userLink } = await sb.from("bot_user_links").select("user_id").eq("platform", PLATFORM).eq("platform_identifier", normalizePhone(member_phone)).single();
  if (!userLink) return { error: tr.activateFirst, status: 404 };

  // Add contribution with source = 'whatsapp'
  await sb.from("contributions").insert({
    group_id: link.group_id,
    user_id: userLink.user_id,
    amount,
    type: "deposit",
    note: "Via WhatsApp",
    source: "whatsapp",
  });

  const { data: group } = await sb.from("groups").select("*").eq("id", link.group_id).single();
  const { data: contributions } = await sb.from("contributions").select("amount, type").eq("group_id", link.group_id);
  
  const totalSaved = (contributions || []).reduce((sum: number, c: any) => c.type === "deposit" ? sum + Number(c.amount) : sum - Number(c.amount), 0);
  const pct = group?.goal_amount > 0 ? (totalSaved / group.goal_amount) * 100 : 0;
  const cur = "USD";

  return {
    text: `${tr.contributionAdded}\n\n📊 ${progressBar(Math.min(100, pct))} — ${formatAmount(totalSaved, cur)} ${tr.of} ${formatAmount(group?.goal_amount || 0, cur)}`,
  };
}

async function handleRegisterSalary(body: any) {
  const sb = getSupabaseAdmin();
  const { member_phone, salary, group_whatsapp_id } = body;

  const { data: userLink } = await sb.from("bot_user_links").select("user_id").eq("platform", PLATFORM).eq("platform_identifier", normalizePhone(member_phone)).single();
  if (!userLink) return { error: "User not linked", status: 404 };

  let lang: Lang = "en";
  if (group_whatsapp_id) {
    const { data: link } = await sb.from("bot_group_links").select("language").eq("platform", PLATFORM).eq("platform_group_id", group_whatsapp_id).single();
    if (link) lang = getLang(link.language);
  }

  const { data: memberships } = await sb.from("group_memberships").select("id").eq("user_id", userLink.user_id);
  if (memberships?.length) {
    await sb.from("group_memberships").update({ salary }).eq("user_id", userLink.user_id);
  }

  return { text: t[lang].salaryRegistered };
}

async function handleCompetitionStart(body: any) {
  const sb = getSupabaseAdmin();
  const { group_whatsapp_id } = body;

  const { data: link } = await sb.from("bot_group_links").select("group_id, language").eq("platform", PLATFORM).eq("platform_group_id", group_whatsapp_id).single();
  if (!link) return { error: "Group not linked", status: 404 };

  const lang = getLang(link.language);
  await sb.from("groups").update({ is_open_goal: true }).eq("id", link.group_id);

  return { text: t[lang].competitionStarted };
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
  const cur = "USD";

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
    if (group?.competition_end_date) {
      const days = daysUntil(group.competition_end_date);
      text += `\n📅 ${tr.daysLeft.replace("{n}", String(days))}`;
    }
  }

  text += `\n\n👉 billi.app`;
  return { text };
}

async function handleProgress(groupPlatformId: string) {
  const sb = getSupabaseAdmin();

  const { data: link } = await sb.from("bot_group_links").select("group_id, language").eq("platform", PLATFORM).eq("platform_group_id", groupPlatformId).single();
  if (!link) return { error: "Group not linked", status: 404 };

  const lang = getLang(link.language);
  const tr = t[lang];

  const { data: group } = await sb.from("groups").select("*").eq("id", link.group_id).single();
  const { data: contributions } = await sb.from("contributions").select("amount, type").eq("group_id", link.group_id);

  const totalSaved = (contributions || []).reduce((sum: number, c: any) => c.type === "deposit" ? sum + Number(c.amount) : sum - Number(c.amount), 0);
  const pct = group?.goal_amount > 0 ? (totalSaved / group.goal_amount) * 100 : 0;
  const cur = "USD";

  let text = `📊 ${tr.progress} — ${group?.name}\n\n${progressBar(Math.min(100, pct))} — ${formatAmount(totalSaved, cur)} ${tr.of} ${formatAmount(group?.goal_amount || 0, cur)}`;

  if (group?.competition_end_date) {
    const days = daysUntil(group.competition_end_date);
    text += `\n📅 ${tr.daysLeft.replace("{n}", String(days))}`;
  }

  text += `\n\n👉 billi.app`;
  return { text };
}

async function handleBadges(memberPhone: string) {
  const sb = getSupabaseAdmin();

  const { data: userLink } = await sb.from("bot_user_links").select("user_id").eq("platform", PLATFORM).eq("platform_identifier", normalizePhone(memberPhone)).single();
  if (!userLink) return { error: "User not linked", status: 404 };

  const { data: profile } = await sb.from("profiles").select("*").eq("id", userLink.user_id).single();
  const lang = getLang(profile?.language || "en");
  const tr = t[lang];

  const badges: string[] = [];
  if (profile) {
    if ((profile.total_contributions || 0) >= 1) badges.push("🥇");
    if ((profile.current_streak || 0) >= 90) badges.push("🔥");
    if ((profile.level || 0) >= 10) badges.push("🏆");
    if ((profile.best_streak || 0) >= 365) badges.push("🌟");
  }

  if (badges.length === 0) return { text: `${tr.badges}\n\n${tr.noBadges}` };
  return { text: `${tr.badges}\n\n${badges.join(" ")}` };
}

async function handleCoupon(memberPhone: string) {
  const sb = getSupabaseAdmin();

  const { data: userLink } = await sb.from("bot_user_links").select("user_id").eq("platform", PLATFORM).eq("platform_identifier", normalizePhone(memberPhone)).single();
  if (!userLink) return { error: "User not linked", status: 404 };

  const { data: profile } = await sb.from("profiles").select("language").eq("id", userLink.user_id).single();
  const lang = getLang(profile?.language || "en");
  const tr = t[lang];

  const { data: coupons } = await sb.from("partner_coupons").select("code, description, discount_percentage, discount_amount").eq("is_active", true).limit(5);

  if (!coupons?.length) return { text: `${tr.coupons}\n\n${tr.noCoupons}` };

  let text = `🎟️ ${tr.coupons}\n\n`;
  for (const c of coupons) {
    const disc = c.discount_percentage ? `${c.discount_percentage}% OFF` : c.discount_amount ? `$${c.discount_amount} OFF` : "";
    text += `• ${c.code} — ${c.description} ${disc}\n`;
  }
  return { text };
}

async function handleHelp(senderPhone: string) {
  const sb = getSupabaseAdmin();
  // Try to find user's language
  const { data: userLink } = await sb.from("bot_user_links").select("user_id").eq("platform", PLATFORM).eq("platform_identifier", normalizePhone(senderPhone)).single();
  
  let lang: Lang = "pt"; // default
  if (userLink) {
    const { data: profile } = await sb.from("profiles").select("language").eq("id", userLink.user_id).single();
    if (profile?.language) lang = getLang(profile.language);
  }
  
  return { text: t[lang].help };
}

// ===== MAIN HANDLER =====
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/whatsapp-bot\/?/, "");

    let result: any;

    if (req.method === "POST") {
      const body = await req.json();

      if (path === "activate" || path === "api/whatsapp/activate") {
        result = await handleActivate(body);
      } else if (path === "group-create" || path === "api/whatsapp/group-create") {
        result = await handleGroupCreate(body);
      } else if (path === "contribution" || path === "api/whatsapp/contribution") {
        result = await handleContribution(body);
      } else if (path === "competition/register-salary" || path === "api/whatsapp/competition/register-salary") {
        result = await handleRegisterSalary(body);
      } else if (path === "competition/start" || path === "api/whatsapp/competition/start") {
        result = await handleCompetitionStart(body);
      } else if (path === "help" || path === "api/whatsapp/help") {
        result = await handleHelp(body.sender_phone || "");
      } else {
        result = { error: "Unknown endpoint", status: 404 };
      }
    } else if (req.method === "GET") {
      const parts = path.split("/");
      
      if (parts[0] === "ranking" && parts[1]) {
        result = await handleRanking(parts[1]);
      } else if (parts[0] === "progress" && parts[1]) {
        result = await handleProgress(parts[1]);
      } else if (parts[0] === "badges" && parts[1]) {
        result = await handleBadges(parts[1]);
      } else if (parts[0] === "coupon" && parts[1]) {
        result = await handleCoupon(parts[1]);
      } else if (parts[0] === "help") {
        result = await handleHelp(parts[1] || "");
      } else {
        result = { error: "Unknown endpoint", status: 404 };
      }
    }

    const status = result?.status || (result?.error ? 400 : 200);
    return new Response(JSON.stringify(result), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
