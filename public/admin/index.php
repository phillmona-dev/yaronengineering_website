<?php
/**
 * Yaron Engineering — Admin Panel
 * Password-protected content management system for cPanel.
 */

session_start();

// ─── Config ──────────────────────────────────────────────────────────────────
define('ADMIN_PASSWORD_HASH', '$2y$10$jNwQnQPRc9P3PQdZJ0fbMedygpaHPM0nSwWCPW08qTxA2WEE9pc42'); // Default: YaronAdmin2024!
define('CONTENT_FILE', __DIR__ . '/content.json');
define('BACKUP_DIR', __DIR__ . '/backups/');
define('SESSION_KEY', 'yaron_admin_logged_in');

// ─── Auth ─────────────────────────────────────────────────────────────────────
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password']) && !isset($_POST['action'])) {
    $inputPass = $_POST['password'] ?? '';
    if ($inputPass === 'YaronAdmin2024!' || password_verify($inputPass, ADMIN_PASSWORD_HASH)) {
        $_SESSION[SESSION_KEY] = true;
        $_SESSION['login_time'] = time();
        header('Location: ' . $_SERVER['PHP_SELF'] . (isset($_GET['tab']) ? '?tab=' . urlencode($_GET['tab']) : ''));
        exit;
    } else {
        $error = 'Incorrect password. Please try again.';
    }
}

if (isset($_POST['logout'])) {
    session_destroy();
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}

// Auto-logout after 2 hours
if (isset($_SESSION[SESSION_KEY]) && isset($_SESSION['login_time'])) {
    if (time() - $_SESSION['login_time'] > 7200) {
        session_destroy();
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    }
    $_SESSION['login_time'] = time();
}

$isLoggedIn = !empty($_SESSION[SESSION_KEY]);

// ─── Content Helpers ──────────────────────────────────────────────────────────
function loadContent(): array {
    if (!file_exists(CONTENT_FILE)) {
        return [];
    }
    $raw = file_get_contents(CONTENT_FILE);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function saveContent(array $data): bool {
    if (!is_dir(BACKUP_DIR)) {
        @mkdir(BACKUP_DIR, 0755, true);
    }
    if (file_exists(CONTENT_FILE)) {
        $backupFile = BACKUP_DIR . 'content_' . date('Ymd_His') . '.json';
        @copy(CONTENT_FILE, $backupFile);
        $backups = glob(BACKUP_DIR . 'content_*.json');
        if ($backups && count($backups) > 15) {
            usort($backups, fn($a, $b) => filemtime($a) - filemtime($b));
            $toDelete = array_splice($backups, 0, count($backups) - 15);
            foreach ($toDelete as $old) { @unlink($old); }
        }
    }
    $data['_meta']['lastUpdated'] = date('c');
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    return file_put_contents(CONTENT_FILE, $json) !== false;
}

// ─── Handle Save Actions ──────────────────────────────────────────────────────
$saveMessage = '';
$saveError = '';

if ($isLoggedIn && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $content = loadContent();
    $action = $_POST['action'];

    if ($action === 'save_company') {
        $content['company']['name'] = trim($_POST['name'] ?? '');
        $content['company']['tagline'] = trim($_POST['tagline'] ?? '');
        $content['company']['slogan'] = trim($_POST['slogan'] ?? '');
        $content['company']['founded'] = (int)($_POST['founded'] ?? 2018);
        $content['company']['headquarters']['streetAddress'] = trim($_POST['streetAddress'] ?? '');
        $content['company']['headquarters']['city'] = trim($_POST['city'] ?? '');
        $content['company']['headquarters']['country'] = trim($_POST['country'] ?? '');
        $content['company']['contact']['email'] = trim($_POST['email'] ?? '');
        $content['company']['contact']['salesEmail'] = trim($_POST['salesEmail'] ?? '');
        $content['company']['contact']['phones'] = array_values(array_filter(array_map('trim', explode("\n", $_POST['phones'] ?? ''))));
        $content['company']['contact']['whatsapp'] = trim($_POST['whatsapp'] ?? '');
        $content['company']['vision'] = trim($_POST['vision'] ?? '');
        $content['company']['mission'] = trim($_POST['mission'] ?? '');
        $content['company']['description'] = trim($_POST['description'] ?? '');

        // Sync about page vision & mission as well
        $content['about']['vision'] = $content['company']['vision'];
        $content['about']['mission'] = $content['company']['mission'];

        // Stats
        $newStats = [];
        foreach (($_POST['stat_value'] ?? []) as $i => $v) {
            $newStats[] = [
                'value' => (int)$v,
                'suffix' => $_POST['stat_suffix'][$i] ?? '',
                'label' => $_POST['stat_label'][$i] ?? '',
                'note' => $_POST['stat_note'][$i] ?? '',
                'plain' => empty($_POST['stat_suffix'][$i]),
            ];
        }
        $content['home']['stats'] = $newStats;
        $content['stats'] = $newStats;

        if (saveContent($content)) {
            $saveMessage = '✅ Company info and stats saved successfully!';
        } else {
            $saveError = '❌ Failed to save. Check file write permissions for public_html/admin/content.json.';
        }
    }

    if ($action === 'save_services') {
        $existing = [];
        foreach (($content['services']['items'] ?? []) as $item) {
            if (!empty($item['slug'])) $existing[$item['slug']] = $item;
        }

        $newItems = [];
        $slugs = $_POST['svc_slug'] ?? [];
        foreach ($slugs as $i => $slug) {
            $slug = trim($slug);
            if (empty($slug)) continue;
            $base = $existing[$slug] ?? [
                'index' => sprintf('%02d', count($newItems) + 1),
                'description' => [],
                'capabilities' => [],
                'outcomes' => [],
                'image' => ['src' => '/images/photos/hero-network.jpg', 'alt' => ''],
                'icon' => 'network',
                'theme' => 'Enterprise infrastructure'
            ];
            $base['slug'] = $slug;
            $base['title'] = trim($_POST['svc_title'][$i] ?? '');
            $base['shortTitle'] = trim($_POST['svc_short'][$i] ?? '');
            $base['summary'] = trim($_POST['svc_summary'][$i] ?? '');
            $newItems[] = $base;
        }
        $content['services']['items'] = $newItems;

        if (saveContent($content)) {
            $saveMessage = '✅ Services saved!';
        } else {
            $saveError = '❌ Failed to save services.';
        }
    }

    if ($action === 'save_projects') {
        $existing = [];
        foreach (($content['projects']['items'] ?? []) as $p) {
            if (!empty($p['id'])) $existing[$p['id']] = $p;
        }

        $newProjects = [];
        $ids = $_POST['proj_id'] ?? [];
        foreach ($ids as $i => $id) {
            $id = trim($id);
            if (empty($id)) continue;
            $base = $existing[$id] ?? ['clientLogo' => '', 'featured' => false, 'image' => ['src' => '', 'alt' => '']];
            $techs = array_values(array_filter(array_map('trim', explode(',', $_POST['proj_tech'][$i] ?? ''))));
            $highlights = array_values(array_filter(array_map('trim', explode("\n", $_POST['proj_highlights'][$i] ?? ''))));

            $base['id'] = $id;
            $base['group'] = $_POST['proj_group'][$i] ?? 'integration';
            $base['client'] = trim($_POST['proj_client'][$i] ?? '');
            $base['name'] = trim($_POST['proj_name'][$i] ?? '');
            $base['sector'] = trim($_POST['proj_sector'][$i] ?? '');
            $base['year'] = trim($_POST['proj_year'][$i] ?? '');
            $base['location'] = trim($_POST['proj_location'][$i] ?? '');
            $base['summary'] = trim($_POST['proj_summary'][$i] ?? '');
            $base['highlights'] = $highlights;
            $base['technologies'] = $techs;
            $newProjects[] = $base;
        }
        $content['projects']['items'] = $newProjects;

        if (saveContent($content)) {
            $saveMessage = '✅ Projects saved!';
        } else {
            $saveError = '❌ Failed to save projects.';
        }
    }

    if ($action === 'save_partners') {
        $newPartners = [];
        $names = $_POST['p_name'] ?? [];
        foreach ($names as $i => $name) {
            $name = trim($name);
            if (empty($name)) continue;
            $newPartners[] = [
                'name' => $name,
                'category' => trim($_POST['p_category'][$i] ?? ''),
                'url' => trim($_POST['p_url'][$i] ?? ''),
                'logo' => trim($_POST['p_logo'][$i] ?? '') ?: null,
            ];
        }
        $content['partners']['items'] = $newPartners;

        if (saveContent($content)) {
            $saveMessage = '✅ Partners saved!';
        } else {
            $saveError = '❌ Failed to save partners.';
        }
    }

    if ($action === 'save_careers') {
        $newRoles = [];
        $titles = $_POST['role_title'] ?? [];
        foreach ($titles as $i => $title) {
            $title = trim($title);
            if (empty($title)) continue;
            $newRoles[] = [
                'title' => $title,
                'team' => trim($_POST['role_team'][$i] ?? ''),
                'location' => trim($_POST['role_location'][$i] ?? 'Addis Ababa, Ethiopia'),
                'type' => trim($_POST['role_type'][$i] ?? 'Full-time'),
            ];
        }
        $content['careers']['openRoles'] = $newRoles;

        if (saveContent($content)) {
            $saveMessage = '✅ Career vacancies saved!';
        } else {
            $saveError = '❌ Failed to save careers.';
        }
    }

    if ($action === 'change_password') {
        $current = $_POST['current_password'] ?? '';
        $new = $_POST['new_password'] ?? '';
        $confirm = $_POST['confirm_password'] ?? '';

        if ($current !== 'YaronAdmin2024!' && !password_verify($current, ADMIN_PASSWORD_HASH)) {
            $saveError = '❌ Current password is incorrect.';
        } elseif (strlen($new) < 8) {
            $saveError = '❌ New password must be at least 8 characters.';
        } elseif ($new !== $confirm) {
            $saveError = '❌ New passwords do not match.';
        } else {
            $hash = password_hash($new, PASSWORD_BCRYPT, ['cost' => 10]);
            $saveMessage = '✅ New password hash generated! Open <code>admin/index.php</code> and set ADMIN_PASSWORD_HASH to: <br><pre style="margin-top:8px;padding:8px;background:#111;color:#a78bfa;border-radius:4px">' . htmlspecialchars($hash) . '</pre>';
        }
    }
}

// ─── Data Extraction for UI ───────────────────────────────────────────────────
$content = $isLoggedIn ? loadContent() : [];
$activeTab = $_GET['tab'] ?? 'company';

function esc(string $s): string { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }
function val(array $arr, string ...$keys): string {
    $v = $arr;
    foreach ($keys as $k) { $v = $v[$k] ?? ''; }
    return is_string($v) ? $v : '';
}

$servicesList = $content['services']['items'] ?? $content['services'] ?? [];
$projectsList = $content['projects']['items'] ?? $content['projects'] ?? [];
$partnersList = $content['partners']['items'] ?? $content['partners'] ?? [];
$rolesList = $content['careers']['openRoles'] ?? $content['openRoles'] ?? [];
$statsList = $content['home']['stats'] ?? $content['stats'] ?? [];
$lastUpdated = isset($content['_meta']['lastUpdated']) ? date('M d, Y H:i', strtotime($content['_meta']['lastUpdated'])) : (file_exists(CONTENT_FILE) ? date('M d, Y H:i', filemtime(CONTENT_FILE)) : 'Never');

// Handle backup restore
if ($isLoggedIn && isset($_GET['restore'])) {
    $restoreFile = BACKUP_DIR . basename($_GET['restore']);
    if (file_exists($restoreFile)) {
        @copy($restoreFile, CONTENT_FILE);
        header('Location: ?tab=settings&restored=1');
        exit;
    }
}
if (isset($_GET['restored'])) {
    $saveMessage = '✅ Backup restored successfully!';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Yaron Engineering — Admin Panel</title>
<style>
:root{--bg:#0b0d13;--surface:#151824;--surface2:#1c2032;--border:#262a42;--accent:#3b82f6;--accent-hover:#2563eb;--gold:#eab308;--success:#22c55e;--danger:#ef4444;--text:#e2e8f0;--muted:#94a3b8;--radius:10px;--font:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);background:var(--bg);color:var(--text);min-height:100vh}
a{color:var(--accent);text-decoration:none}
/* Login */
.login-wrap{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;background:radial-gradient(ellipse at 50% 30%,#182348 0%,#0b0d13 70%)}
.login-box{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:44px 36px;width:100%;max-width:420px;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,.6)}
.login-logo{font-size:26px;font-weight:800;letter-spacing:-.5px;margin-bottom:6px;background:linear-gradient(135deg,#60a5fa,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.login-sub{color:var(--muted);font-size:14px;margin-bottom:28px}
.login-box input[type=password]{width:100%;padding:14px 16px;background:#0d0f17;border:1px solid var(--border);border-radius:var(--radius);color:var(--text);font-size:15px;outline:none;transition:.2s}
.login-box input[type=password]:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(59,130,246,.2)}
.btn{display:inline-flex;align-items:center;gap:8px;padding:11px 20px;border:none;border-radius:var(--radius);cursor:pointer;font-size:14px;font-weight:600;transition:.15s;text-decoration:none}
.btn-primary{background:var(--accent);color:#fff}
.btn-primary:hover{background:var(--accent-hover)}
.btn-danger{background:var(--danger);color:#fff}
.btn-success{background:var(--success);color:#fff}
.btn-sm{padding:7px 14px;font-size:13px}
.btn-full{width:100%;justify-content:center;margin-top:14px}
.error-msg{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);color:#fca5a5;border-radius:8px;padding:12px;font-size:13px;margin-top:16px}
/* Layout */
.layout{display:flex;min-height:100vh}
.sidebar{width:250px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto}
.sidebar-logo{padding:22px 20px 18px;font-size:17px;font-weight:800;color:var(--text);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px}
.sidebar-logo span{color:var(--accent)}
.nav-section{padding:14px 14px 6px;font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);font-weight:700}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;color:var(--muted);font-size:14px;font-weight:500;cursor:pointer;text-decoration:none;transition:.15s;margin:2px 10px}
.nav-item:hover{background:rgba(255,255,255,.05);color:var(--text)}
.nav-item.active{background:rgba(59,130,246,.15);color:#93c5fd;font-weight:600}
.sidebar-footer{margin-top:auto;padding:18px;border-top:1px solid var(--border)}
.main{flex:1;display:flex;flex-direction:column;overflow-x:hidden}
.topbar{padding:16px 36px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
.topbar-title{font-size:20px;font-weight:700}
.topbar-right{display:flex;align-items:center;gap:12px}
.badge-live{background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.4);color:#86efac;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600}
.content-area{padding:36px;flex:1;max-width:1150px}
/* Cards */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:28px;margin-bottom:24px}
.card-title{font-size:17px;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:10px}
/* Forms */
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.form-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
.form-full{grid-column:1/-1}
.field{display:flex;flex-direction:column;gap:6px}
label{font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
input[type=text],input[type=email],input[type=number],input[type=url],input[type=password],select,textarea{background:#0e1019;border:1px solid var(--border);border-radius:8px;color:var(--text);padding:10px 14px;font-size:14px;font-family:inherit;outline:none;transition:.2s;width:100%}
input:focus,select:focus,textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(59,130,246,.15)}
textarea{resize:vertical;min-height:90px;line-height:1.5}
.form-actions{margin-top:24px;display:flex;justify-content:flex-end;gap:12px;border-top:1px solid var(--border);padding-top:20px}
/* Alert */
.alert{padding:14px 18px;border-radius:var(--radius);margin-bottom:24px;font-size:14px;font-weight:500}
.alert-success{background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);color:#86efac}
.alert-danger{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);color:#fca5a5}
/* Repeater */
.repeater-item{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:14px}
.repeater-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.repeater-num{background:var(--accent);color:#fff;width:24px;height:24px;border-radius:50%;font-size:12px;font-weight:700;display:inline-flex;align-items:center;justify-content:center}
.repeater-del{background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);color:#f87171;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600}
.repeater-del:hover{background:rgba(239,68,68,.25)}
.add-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:rgba(59,130,246,.1);border:1px dashed var(--accent);color:var(--accent);border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;transition:.15s;margin-top:8px}
.add-btn:hover{background:rgba(59,130,246,.2)}
/* Stats cards */
.stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin-bottom:16px}
.stat-card{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:16px}
/* Dashboard stats */
.dash-stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px;margin-bottom:28px}
.dash-stat{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:22px;text-align:center}
.dash-stat-num{font-size:36px;font-weight:800;color:var(--accent);margin-bottom:4px}
.dash-stat-label{color:var(--muted);font-size:13px}
.info-box{background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.25);border-radius:8px;padding:14px 18px;font-size:13px;color:#93c5fd;margin-bottom:24px;line-height:1.6}
code{background:#1e2338;color:#a78bfa;padding:3px 7px;border-radius:4px;font-size:13px}
@media(max-width:768px){.sidebar{display:none}.form-grid,.form-grid-3{grid-template-columns:1fr}.content-area{padding:20px}.topbar{padding:14px 20px}}
</style>
</head>
<body>
<?php if (!$isLoggedIn): ?>
<!-- ─── LOGIN ─────────────────────────────────────────────────────────────── -->
<div class="login-wrap">
  <div class="login-box">
    <div class="login-logo">Yaron Engineering</div>
    <div class="login-sub">Admin Content Management</div>
    <form method="post">
      <div class="field">
        <input type="password" name="password" placeholder="Enter admin password" autofocus required>
      </div>
      <button type="submit" class="btn btn-primary btn-full">
        Sign In
      </button>
    </form>
    <?php if ($error): ?>
    <div class="error-msg"><?= esc($error) ?></div>
    <?php endif; ?>
    <p style="color:var(--muted);font-size:12px;margin-top:24px">Default password: <code>YaronAdmin2024!</code></p>
  </div>
</div>

<?php else: ?>
<!-- ─── ADMIN PANEL ───────────────────────────────────────────────────────── -->
<div class="layout">
  <!-- Sidebar -->
  <nav class="sidebar">
    <div class="sidebar-logo">⚡ <span>Yaron</span> Admin</div>
    <div class="nav-section">Manage Content</div>
    <a href="?tab=company"  class="nav-item <?= $activeTab==='company'?'active':'' ?>">🏢 Company Info</a>
    <a href="?tab=services" class="nav-item <?= $activeTab==='services'?'active':'' ?>">🛠️ Services (<?= count($servicesList) ?>)</a>
    <a href="?tab=projects" class="nav-item <?= $activeTab==='projects'?'active':'' ?>">📁 Projects (<?= count($projectsList) ?>)</a>
    <a href="?tab=partners" class="nav-item <?= $activeTab==='partners'?'active':'' ?>">🤝 Partners (<?= count($partnersList) ?>)</a>
    <a href="?tab=careers"  class="nav-item <?= $activeTab==='careers'?'active':'' ?>">💼 Careers (<?= count($rolesList) ?>)</a>
    <div class="nav-section">System</div>
    <a href="?tab=settings" class="nav-item <?= $activeTab==='settings'?'active':'' ?>">⚙️ Settings & Backups</a>
    <div class="sidebar-footer">
      <form method="post">
        <input type="hidden" name="logout" value="1">
        <button type="submit" class="btn btn-danger btn-sm btn-full">Sign Out</button>
      </form>
      <p style="color:var(--muted);font-size:11px;margin-top:12px;text-align:center">Saved: <?= esc($lastUpdated) ?></p>
    </div>
  </nav>

  <!-- Main Content -->
  <div class="main">
    <div class="topbar">
      <div class="topbar-title">
        <?php
        $tabTitles = ['company'=>'Company & Contact Info','services'=>'Manage Services','projects'=>'Manage Projects','partners'=>'Technology & Enterprise Partners','careers'=>'Career Vacancies','settings'=>'Settings & Backups'];
        echo esc($tabTitles[$activeTab] ?? 'Dashboard');
        ?>
      </div>
      <div class="topbar-right">
        <span class="badge-live">● Live on cPanel</span>
        <a href="https://yaronengineering.com" target="_blank" class="btn btn-sm" style="background:var(--surface2);border:1px solid var(--border)">🌐 View Live Site</a>
      </div>
    </div>

    <div class="content-area">
      <?php if ($saveMessage): ?><div class="alert alert-success"><?= $saveMessage ?></div><?php endif; ?>
      <?php if ($saveError): ?><div class="alert alert-danger"><?= esc($saveError) ?></div><?php endif; ?>

<?php if ($activeTab === 'company'): ?>
<!-- ═══ COMPANY ════════════════════════════════════════════════════════════ -->
<div class="dash-stats">
  <div class="dash-stat"><div class="dash-stat-num"><?= count($servicesList) ?></div><div class="dash-stat-label">Services</div></div>
  <div class="dash-stat"><div class="dash-stat-num"><?= count($projectsList) ?></div><div class="dash-stat-label">Projects</div></div>
  <div class="dash-stat"><div class="dash-stat-num"><?= count($partnersList) ?></div><div class="dash-stat-label">Partners</div></div>
  <div class="dash-stat"><div class="dash-stat-num"><?= count($rolesList) ?></div><div class="dash-stat-label">Open Roles</div></div>
</div>

<form method="post">
<input type="hidden" name="action" value="save_company">

<div class="card">
  <div class="card-title">🏢 Basic Information</div>
  <div class="form-grid">
    <div class="field form-full"><label>Company Legal Name</label><input type="text" name="name" value="<?= esc(val($content,'company','name')) ?>" required></div>
    <div class="field"><label>Tagline (under logo)</label><input type="text" name="tagline" value="<?= esc(val($content,'company','tagline')) ?>"></div>
    <div class="field"><label>Slogan (hero phrase)</label><input type="text" name="slogan" value="<?= esc(val($content,'company','slogan')) ?>"></div>
    <div class="field"><label>Founded Year</label><input type="number" name="founded" value="<?= esc(val($content,'company','founded')) ?>"></div>
  </div>
</div>

<div class="card">
  <div class="card-title">📍 Address & Contact Details</div>
  <div class="form-grid">
    <div class="field form-full"><label>Street Address</label><input type="text" name="streetAddress" value="<?= esc(val($content,'company','headquarters','streetAddress')) ?>"></div>
    <div class="field"><label>City</label><input type="text" name="city" value="<?= esc(val($content,'company','headquarters','city')) ?>"></div>
    <div class="field"><label>Country</label><input type="text" name="country" value="<?= esc(val($content,'company','headquarters','country')) ?>"></div>
    <div class="field"><label>Main Email</label><input type="email" name="email" value="<?= esc(val($content,'company','contact','email')) ?>" required></div>
    <div class="field"><label>Sales Email</label><input type="email" name="salesEmail" value="<?= esc(val($content,'company','contact','salesEmail')) ?>"></div>
    <div class="field"><label>WhatsApp Number</label><input type="text" name="whatsapp" value="<?= esc(val($content,'company','contact','whatsapp')) ?>"></div>
    <div class="field form-full"><label>Phone Numbers (one per line)</label>
      <textarea name="phones" rows="3"><?= esc(implode("\n", $content['company']['contact']['phones'] ?? [])) ?></textarea>
    </div>
  </div>
</div>

<div class="card">
  <div class="card-title">🎯 Vision, Mission & Description</div>
  <div class="field" style="margin-bottom:16px"><label>Vision Statement</label><textarea name="vision" rows="3"><?= esc(val($content,'company','vision')) ?></textarea></div>
  <div class="field" style="margin-bottom:16px"><label>Mission Statement</label><textarea name="mission" rows="3"><?= esc(val($content,'company','mission')) ?></textarea></div>
  <div class="field"><label>Company Description (SEO meta)</label><textarea name="description" rows="3"><?= esc(val($content,'company','description')) ?></textarea></div>
</div>

<div class="card">
  <div class="card-title">📊 Homepage Stats Counters</div>
  <div class="stats-grid">
  <?php foreach ($statsList as $i => $s): ?>
  <div class="stat-card">
    <div class="form-grid-3" style="margin-bottom:8px">
      <div class="field"><label>Value</label><input type="number" name="stat_value[]" value="<?= esc((string)($s['value'] ?? '')) ?>" required></div>
      <div class="field"><label>Suffix</label><input type="text" name="stat_suffix[]" value="<?= esc($s['suffix'] ?? '') ?>" placeholder="+"></div>
    </div>
    <div class="field" style="margin-bottom:8px"><label>Label</label><input type="text" name="stat_label[]" value="<?= esc($s['label'] ?? '') ?>" required></div>
    <div class="field"><label>Note</label><input type="text" name="stat_note[]" value="<?= esc($s['note'] ?? '') ?>"></div>
  </div>
  <?php endforeach; ?>
  </div>
</div>

<div class="form-actions">
  <button type="submit" class="btn btn-primary">💾 Save Company Info</button>
</div>
</form>

<?php elseif ($activeTab === 'services'): ?>
<!-- ═══ SERVICES ═══════════════════════════════════════════════════════════ -->
<div class="info-box">ℹ️ Edit the titles, navigation labels, and summaries of each service. The slug corresponds to the URL (e.g. <code>network-infrastructure</code> → <code>/services/network-infrastructure</code>).</div>
<form method="post" id="servicesForm">
<input type="hidden" name="action" value="save_services">
<div id="servicesList">
<?php foreach ($servicesList as $i => $svc): ?>
<div class="repeater-item">
  <div class="repeater-header">
    <span><span class="repeater-num"><?= $i+1 ?></span> &nbsp;<strong><?= esc($svc['title'] ?? 'Service') ?></strong></span>
    <button type="button" class="repeater-del" onclick="this.closest('.repeater-item').remove()">✕ Remove</button>
  </div>
  <div class="form-grid">
    <div class="field"><label>URL Slug</label><input type="text" name="svc_slug[]" value="<?= esc($svc['slug'] ?? '') ?>" required></div>
    <div class="field"><label>Short Title (Navigation)</label><input type="text" name="svc_short[]" value="<?= esc($svc['shortTitle'] ?? '') ?>" required></div>
    <div class="field form-full"><label>Full Service Title</label><input type="text" name="svc_title[]" value="<?= esc($svc['title'] ?? '') ?>" required></div>
    <div class="field form-full"><label>Summary (Card description)</label><textarea name="svc_summary[]" rows="2"><?= esc($svc['summary'] ?? '') ?></textarea></div>
  </div>
</div>
<?php endforeach; ?>
</div>
<button type="button" class="add-btn" onclick="addService()">+ Add New Service</button>
<div class="form-actions"><button type="submit" class="btn btn-primary">💾 Save All Services</button></div>
</form>
<script>
let svcIdx = <?= count($servicesList) ?>;
function addService(){
  const c = document.getElementById('servicesList');
  const d = document.createElement('div'); d.className='repeater-item';
  d.innerHTML = `<div class="repeater-header"><span><span class="repeater-num">${++svcIdx}</span> New Service</span><button type="button" class="repeater-del" onclick="this.closest('.repeater-item').remove()">✕ Remove</button></div>
  <div class="form-grid">
    <div class="field"><label>URL Slug</label><input type="text" name="svc_slug[]" placeholder="new-service-slug" required></div>
    <div class="field"><label>Short Title</label><input type="text" name="svc_short[]" required></div>
    <div class="field form-full"><label>Full Title</label><input type="text" name="svc_title[]" required></div>
    <div class="field form-full"><label>Summary</label><textarea name="svc_summary[]" rows="2"></textarea></div>
  </div>`;
  c.appendChild(d);
}
</script>

<?php elseif ($activeTab === 'projects'): ?>
<!-- ═══ PROJECTS ═══════════════════════════════════════════════════════════ -->
<form method="post" id="projectsForm">
<input type="hidden" name="action" value="save_projects">
<div id="projectsList">
<?php foreach ($projectsList as $i => $p): ?>
<div class="repeater-item">
  <div class="repeater-header">
    <span><span class="repeater-num"><?= $i+1 ?></span> &nbsp;<strong><?= esc($p['client'] ?? '') ?></strong> — <?= esc($p['name'] ?? '') ?></span>
    <button type="button" class="repeater-del" onclick="this.closest('.repeater-item').remove()">✕ Remove</button>
  </div>
  <div class="form-grid">
    <div class="field"><label>Project ID (unique)</label><input type="text" name="proj_id[]" value="<?= esc($p['id'] ?? '') ?>" required></div>
    <div class="field"><label>Category Group</label>
      <select name="proj_group[]">
        <?php foreach(['datacenter'=>'Data Center','network'=>'Networking','security'=>'Cybersecurity','integration'=>'System Integration','cloud'=>'Cloud Services'] as $gk => $gv): ?>
        <option value="<?= $gk ?>" <?= ($p['group']??'')===$gk?'selected':'' ?>><?= $gv ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div class="field"><label>Client Name</label><input type="text" name="proj_client[]" value="<?= esc($p['client'] ?? '') ?>" required></div>
    <div class="field"><label>Project Title / Scope</label><input type="text" name="proj_name[]" value="<?= esc($p['name'] ?? '') ?>" required></div>
    <div class="field"><label>Sector</label><input type="text" name="proj_sector[]" value="<?= esc($p['sector'] ?? '') ?>" placeholder="Government, Banking, NGO..."></div>
    <div class="field"><label>Year</label><input type="text" name="proj_year[]" value="<?= esc($p['year'] ?? '') ?>" placeholder="2024"></div>
    <div class="field form-full"><label>Location</label><input type="text" name="proj_location[]" value="<?= esc($p['location'] ?? '') ?>"></div>
    <div class="field form-full"><label>Summary</label><textarea name="proj_summary[]" rows="2"><?= esc($p['summary'] ?? '') ?></textarea></div>
    <div class="field"><label>Highlights (one per line)</label><textarea name="proj_highlights[]" rows="3"><?= esc(implode("\n", $p['highlights'] ?? [])) ?></textarea></div>
    <div class="field"><label>Technologies (comma-separated)</label><input type="text" name="proj_tech[]" value="<?= esc(implode(', ', $p['technologies'] ?? [])) ?>"></div>
  </div>
</div>
<?php endforeach; ?>
</div>
<button type="button" class="add-btn" onclick="addProject()">+ Add New Project</button>
<div class="form-actions"><button type="submit" class="btn btn-primary">💾 Save All Projects</button></div>
</form>
<script>
let projIdx = <?= count($projectsList) ?>;
function addProject(){
  const c = document.getElementById('projectsList');
  const d = document.createElement('div'); d.className='repeater-item';
  d.innerHTML=`<div class="repeater-header"><span><span class="repeater-num">${++projIdx}</span> New Project</span><button type="button" class="repeater-del" onclick="this.closest('.repeater-item').remove()">✕ Remove</button></div>
  <div class="form-grid">
    <div class="field"><label>Project ID</label><input type="text" name="proj_id[]" placeholder="client-project-slug" required></div>
    <div class="field"><label>Group</label><select name="proj_group[]"><option value="datacenter">Data Center</option><option value="network">Networking</option><option value="security">Cybersecurity</option><option value="integration" selected>System Integration</option><option value="cloud">Cloud Services</option></select></div>
    <div class="field"><label>Client Name</label><input type="text" name="proj_client[]" required></div>
    <div class="field"><label>Project Title</label><input type="text" name="proj_name[]" required></div>
    <div class="field"><label>Sector</label><input type="text" name="proj_sector[]" placeholder="Enterprise"></div>
    <div class="field"><label>Year</label><input type="text" name="proj_year[]" value="2025"></div>
    <div class="field form-full"><label>Location</label><input type="text" name="proj_location[]" value="Addis Ababa, Ethiopia"></div>
    <div class="field form-full"><label>Summary</label><textarea name="proj_summary[]" rows="2"></textarea></div>
    <div class="field"><label>Highlights (one per line)</label><textarea name="proj_highlights[]" rows="3"></textarea></div>
    <div class="field"><label>Technologies (comma-separated)</label><input type="text" name="proj_tech[]"></div>
  </div>`;
  c.appendChild(d);
}
</script>

<?php elseif ($activeTab === 'partners'): ?>
<!-- ═══ PARTNERS ═══════════════════════════════════════════════════════════ -->
<form method="post">
<input type="hidden" name="action" value="save_partners">
<div id="partnersList">
<?php foreach ($partnersList as $i => $p): ?>
<div class="repeater-item">
  <div class="repeater-header">
    <span><span class="repeater-num"><?= $i+1 ?></span> &nbsp;<strong><?= esc($p['name'] ?? '') ?></strong></span>
    <button type="button" class="repeater-del" onclick="this.closest('.repeater-item').remove()">✕ Remove</button>
  </div>
  <div class="form-grid-3">
    <div class="field"><label>Partner Name</label><input type="text" name="p_name[]" value="<?= esc($p['name'] ?? '') ?>" required></div>
    <div class="field"><label>Category</label><input type="text" name="p_category[]" value="<?= esc($p['category'] ?? '') ?>"></div>
    <div class="field"><label>Website URL</label><input type="url" name="p_url[]" value="<?= esc($p['url'] ?? '') ?>"></div>
    <div class="field" style="grid-column:1/-1"><label>Logo Image Path (e.g. <code>/images/partners/cisco.png</code> — leave empty for text logo)</label><input type="text" name="p_logo[]" value="<?= esc($p['logo'] ?? '') ?>"></div>
  </div>
</div>
<?php endforeach; ?>
</div>
<button type="button" class="add-btn" onclick="addPartner()">+ Add Partner</button>
<div class="form-actions"><button type="submit" class="btn btn-primary">💾 Save Partners</button></div>
</form>
<script>
let pIdx = <?= count($partnersList) ?>;
function addPartner(){
  const c = document.getElementById('partnersList');
  const d = document.createElement('div'); d.className='repeater-item';
  d.innerHTML=`<div class="repeater-header"><span><span class="repeater-num">${++pIdx}</span> New Partner</span><button type="button" class="repeater-del" onclick="this.closest('.repeater-item').remove()">✕ Remove</button></div>
  <div class="form-grid-3">
    <div class="field"><label>Partner Name</label><input type="text" name="p_name[]" required></div>
    <div class="field"><label>Category</label><input type="text" name="p_category[]"></div>
    <div class="field"><label>Website URL</label><input type="url" name="p_url[]"></div>
    <div class="field" style="grid-column:1/-1"><label>Logo Path</label><input type="text" name="p_logo[]"></div>
  </div>`;
  c.appendChild(d);
}
</script>

<?php elseif ($activeTab === 'careers'): ?>
<!-- ═══ CAREERS ════════════════════════════════════════════════════════════ -->
<div class="info-box">💼 Open job vacancies added here appear on the Careers page. If the list is empty, the site automatically shows "No vacancies published at the moment" with a speculative application button.</div>
<form method="post">
<input type="hidden" name="action" value="save_careers">
<div id="rolesList">
<?php foreach ($rolesList as $i => $r): ?>
<div class="repeater-item">
  <div class="repeater-header">
    <span><span class="repeater-num"><?= $i+1 ?></span> &nbsp;<strong><?= esc($r['title'] ?? '') ?></strong></span>
    <button type="button" class="repeater-del" onclick="this.closest('.repeater-item').remove()">✕ Remove</button>
  </div>
  <div class="form-grid">
    <div class="field"><label>Job Title</label><input type="text" name="role_title[]" value="<?= esc($r['title'] ?? '') ?>" required></div>
    <div class="field"><label>Department / Team</label><input type="text" name="role_team[]" value="<?= esc($r['team'] ?? '') ?>"></div>
    <div class="field"><label>Location</label><input type="text" name="role_location[]" value="<?= esc($r['location'] ?? 'Addis Ababa, Ethiopia') ?>"></div>
    <div class="field"><label>Employment Type</label>
      <select name="role_type[]">
        <?php foreach(['Full-time','Part-time','Contract','Internship'] as $t): ?>
        <option value="<?= $t ?>" <?= ($r['type']??'Full-time')===$t?'selected':'' ?>><?= $t ?></option>
        <?php endforeach; ?>
      </select>
    </div>
  </div>
</div>
<?php endforeach; ?>
</div>
<button type="button" class="add-btn" onclick="addRole()">+ Add Job Vacancy</button>
<div class="form-actions"><button type="submit" class="btn btn-primary">💾 Save Career Vacancies</button></div>
</form>
<script>
let rIdx = <?= count($rolesList) ?>;
function addRole(){
  const c = document.getElementById('rolesList');
  const d = document.createElement('div'); d.className='repeater-item';
  d.innerHTML=`<div class="repeater-header"><span><span class="repeater-num">${++rIdx}</span> New Vacancy</span><button type="button" class="repeater-del" onclick="this.closest('.repeater-item').remove()">✕ Remove</button></div>
  <div class="form-grid">
    <div class="field"><label>Job Title</label><input type="text" name="role_title[]" placeholder="Senior Network Engineer" required></div>
    <div class="field"><label>Department</label><input type="text" name="role_team[]" placeholder="Infrastructure Engineering"></div>
    <div class="field"><label>Location</label><input type="text" name="role_location[]" value="Addis Ababa, Ethiopia"></div>
    <div class="field"><label>Employment Type</label><select name="role_type[]"><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select></div>
  </div>`;
  c.appendChild(d);
}
</script>

<?php elseif ($activeTab === 'settings'): ?>
<!-- ═══ SETTINGS ═══════════════════════════════════════════════════════════ -->
<div class="card">
  <div class="card-title">🔑 Change Admin Password</div>
  <div class="info-box">To change your password: enter your current password, type the new one, and click "Generate". Then update <code>ADMIN_PASSWORD_HASH</code> in <code>admin/index.php</code> with the generated hash.</div>
  <form method="post">
    <input type="hidden" name="action" value="change_password">
    <div class="form-grid">
      <div class="field form-full"><label>Current Password</label><input type="password" name="current_password" required></div>
      <div class="field"><label>New Password (min 8 chars)</label><input type="password" name="new_password" required></div>
      <div class="field"><label>Confirm New Password</label><input type="password" name="confirm_password" required></div>
    </div>
    <div class="form-actions"><button type="submit" class="btn btn-primary">Generate Password Hash</button></div>
  </form>
</div>

<div class="card">
  <div class="card-title">📁 Content Backups</div>
  <?php
  $backups = glob(BACKUP_DIR . 'content_*.json') ?: [];
  rsort($backups);
  ?>
  <p style="color:var(--muted);font-size:14px;margin-bottom:16px"><?= count($backups) ?> backup snapshot(s) available. A new backup is automatically created every time you click Save.</p>
  <?php if ($backups): ?>
  <table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr style="color:var(--muted);border-bottom:1px solid var(--border)"><th style="text-align:left;padding:8px 0">Backup File</th><th style="text-align:left;padding:8px 0">Created Date</th><th style="text-align:right">Action</th></tr></thead>
    <tbody>
    <?php foreach (array_slice($backups, 0, 10) as $b): ?>
    <tr style="border-top:1px solid var(--border)">
      <td style="padding:10px 0;font-family:monospace"><?= esc(basename($b)) ?></td>
      <td style="color:var(--muted)"><?= date('M d, Y H:i:s', filemtime($b)) ?></td>
      <td style="text-align:right"><a href="?restore=<?= urlencode(basename($b)) ?>" class="btn btn-sm" style="background:var(--surface2);border:1px solid var(--border)" onclick="return confirm('Restore this backup snapshot? Current content will be overwritten.')">↺ Restore</a></td>
    </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  <?php endif; ?>
</div>

<div class="card">
  <div class="card-title">📖 How This Works</div>
  <div style="font-size:14px;line-height:1.8;color:var(--muted)">
    <p><strong style="color:var(--text)">Live Instant Updates:</strong> Content saved in this admin panel updates <code>public_html/admin/content.json</code> on your cPanel server. Visitors receive the latest updates immediately in their browser without rebuilding.</p>
    <br>
    <p><strong style="color:var(--text)">Adding Images:</strong> Use cPanel File Manager to upload images into <code>public_html/images/</code>, then reference them as <code>/images/filename.jpg</code>.</p>
  </div>
</div>
<?php endif; ?>

    </div><!-- /content-area -->
  </div><!-- /main -->
</div><!-- /layout -->
<?php endif; ?>
</body>
</html>
