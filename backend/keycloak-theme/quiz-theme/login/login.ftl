<#--
  QuizLab — özel Keycloak giriş sayfası (split layout).
  Standalone template: Keycloak'ın değişkenlerini (url.loginAction, login.username,
  realm.rememberMe, realm.resetPasswordAllowed, message) kullanır; stiller inline.
-->
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Giriş Yap - QuizLab</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;}
  html,body{margin:0;height:100%;}
  body{font-family:'Manrope',system-ui,sans-serif;color:#0b1c30;background:#f8f9ff;}
  .material-symbols-outlined{font-family:'Material Symbols Outlined';font-weight:normal;font-style:normal;line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;direction:ltr;font-feature-settings:'liga';-webkit-font-smoothing:antialiased;}
  .split{display:flex;height:100vh;width:100%;}
  /* Left brand panel */
  .brand{display:none;}
  @media(min-width:768px){.brand{display:flex;}}
  .brand{width:50%;background:#1e3a8a;color:#fff;flex-direction:column;justify-content:space-between;padding:40px;position:relative;overflow:hidden;}
  .brand .pattern{position:absolute;inset:0;opacity:.12;background-image:radial-gradient(#fff 1px,transparent 1px);background-size:24px 24px;pointer-events:none;}
  .brand-logo{position:relative;z-index:1;display:flex;align-items:center;gap:10px;font-weight:700;font-size:22px;}
  .brand-logo .material-symbols-outlined{font-size:30px;}
  .brand-copy{position:relative;z-index:1;max-width:82%;margin:auto 0;}
  .brand-copy h1{font-size:44px;font-weight:800;line-height:1.1;letter-spacing:-0.02em;margin:0 0 18px;}
  .brand-copy p{font-size:17px;line-height:1.6;color:#dce1ff;margin:0;}
  .brand-foot{position:relative;z-index:1;display:flex;align-items:center;gap:10px;opacity:.75;font-size:13px;}
  /* Right form panel */
  .formside{flex:1;display:flex;align-items:center;justify-content:center;padding:24px;background:#ffffff;}
  .card{width:100%;max-width:420px;}
  .card h2{font-size:30px;font-weight:700;margin:0 0 6px;letter-spacing:-0.02em;}
  .card .sub{color:#5f6a78;font-size:15px;margin:0 0 26px;}
  label{display:block;font-size:13.5px;font-weight:600;margin-bottom:8px;color:#0b1c30;}
  .field{position:relative;margin-bottom:20px;}
  .field .lead{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9aa3b2;font-size:20px;pointer-events:none;}
  .field input{width:100%;height:48px;padding:0 14px 0 42px;border:1px solid #e2e8f0;border-radius:10px;font-family:inherit;font-size:15px;color:#0b1c30;background:#f8f9ff;outline:none;transition:.15s;}
  .field input:focus{border-color:#1e3a8a;background:#fff;box-shadow:0 0 0 3px rgba(30,58,138,.12);}
  .field input::placeholder{color:#9aa3b2;}
  .field input.has-toggle{padding-right:42px;}
  .toggle{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;color:#9aa3b2;cursor:pointer;padding:6px;display:flex;}
  .options{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;font-size:14px;}
  .remember{display:flex;align-items:center;gap:8px;color:#5f6a78;font-weight:500;cursor:pointer;}
  .remember input{width:16px;height:16px;accent-color:#1e3a8a;}
  .options a{color:#1e3a8a;text-decoration:none;font-weight:600;}
  .options a:hover{text-decoration:underline;}
  .submit{width:100%;height:50px;border:none;border-radius:10px;background:#1e3a8a;color:#fff;font-family:inherit;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:.15s;}
  .submit:hover{background:#152a63;}
  .help{text-align:center;margin-top:24px;font-size:13px;color:#5f6a78;line-height:1.6;}
  .help a{color:#1e3a8a;font-weight:600;text-decoration:none;}
  .help a:hover{text-decoration:underline;}
  .alert{padding:12px 14px;border-radius:10px;font-size:14px;margin-bottom:18px;line-height:1.45;}
  .alert-error{background:#ffdad6;color:#93000a;border:1px solid #ffcdc6;}
  .alert-success{background:#e6f4ea;color:#1e8e3e;border:1px solid #cdebd7;}
  .alert-warning,.alert-info{background:#fff7ed;color:#9a3412;border:1px solid #fed7aa;}
</style>
</head>
<body>
<div class="split">
  <!-- Left: brand -->
  <aside class="brand">
    <div class="pattern"></div>
    <div class="brand-logo">
      <span class="material-symbols-outlined">school</span> QuizLab
    </div>
    <div class="brand-copy">
      <h1>Akademik sınav platformuna hoş geldin.</h1>
      <p>Rolüne uygun panel giriş sonrası otomatik açılır. Güvenli ve odaklanmış bir sınav deneyimi için tasarlandı.</p>
    </div>
    <div class="brand-foot">
      <span class="material-symbols-outlined" style="font-size:20px;">shield</span> Güvenli Bağlantı
    </div>
  </aside>

  <!-- Right: form -->
  <main class="formside">
    <div class="card">
      <h2>Giriş Yap</h2>
      <p class="sub">Devam etmek için hesabınla giriş yap.</p>

      <#if message?has_content>
        <div class="alert alert-${message.type}">${kcSanitize(message.summary)?no_esc}</div>
      </#if>

      <#if realm.password>
      <form action="${url.loginAction}" method="post">
        <label for="username">Kullanıcı adı</label>
        <div class="field">
          <span class="lead material-symbols-outlined">person</span>
          <input id="username" name="username" type="text" autofocus autocomplete="username"
                 value="${(login.username!'')}" placeholder="Öğrenci veya personel numaranız" />
        </div>

        <label for="password">Şifre</label>
        <div class="field">
          <span class="lead material-symbols-outlined">lock</span>
          <input id="password" name="password" type="password" autocomplete="current-password"
                 class="has-toggle" placeholder="Şifrenizi girin" />
          <button type="button" class="toggle" onclick="(function(b){var i=document.getElementById('password');var t=i.type==='password';i.type=t?'text':'password';b.firstElementChild.textContent=t?'visibility_off':'visibility';})(this)">
            <span class="material-symbols-outlined">visibility</span>
          </button>
        </div>

        <div class="options">
          <#if realm.rememberMe>
            <label class="remember"><input type="checkbox" name="rememberMe" <#if login.rememberMe??>checked</#if>/> Beni hatırla</label>
          <#else>
            <span></span>
          </#if>
          <#if realm.resetPasswordAllowed>
            <a href="${url.loginResetCredentialsUrl}">Şifremi unuttum</a>
          </#if>
        </div>

        <button type="submit" class="submit">
          Giriş Yap <span class="material-symbols-outlined" style="font-size:20px;">arrow_forward</span>
        </button>
      </form>
      </#if>

      <div class="help">
        Sisteme erişimde sorun mu yaşıyorsunuz?<br>
        <a href="#">Yardım Merkezine Gidin</a>
      </div>
    </div>
  </main>
</div>
</body>
</html>
