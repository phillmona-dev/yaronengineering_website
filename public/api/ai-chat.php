<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// 1. Get API Key
$apiKey = getenv('GEMINI_API_KEY');
if (!$apiKey && file_exists(__DIR__ . '/../../.env.local')) {
    $lines = file(__DIR__ . '/../../.env.local', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), 'GEMINI_API_KEY=') === 0) {
            $apiKey = trim(substr(trim($line), 15));
            break;
        }
    }
}
if (!$apiKey && file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), 'GEMINI_API_KEY=') === 0) {
            $apiKey = trim(substr(trim($line), 15));
            break;
        }
    }
}
if (!$apiKey) {
    http_response_code(500);
    echo json_encode(["error" => "GEMINI_API_KEY is not configured on the server."]);
    exit;
}

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
$messages = $input['messages'] ?? [];
if (!is_array($messages) || empty($messages)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid request: messages array required"]);
    exit;
}

$systemPrompt = "You are an AI assistant embedded on the Yaron Engineering website.\n"
    . "You answer questions about Yaron Engineering PLC in a friendly, professional, and confident way.\n"
    . "Keep answers concise (2-4 sentences max), engaging, and use emojis very sparingly.\n"
    . "If asked something you do not know, say:\n"
    . "\"I don't have that detail on hand — please reach out to our team at info@yaronengineering.com or call +251-11-XXX-XXXX and they'll be happy to help.\"\n"
    . "Never guess, never fabricate facts. Never quote contract values, prices or project costs.\n\n"
    . "── ABOUT YARON ENGINEERING ──\n"
    . "Full name: Yaron Engineering PLC\n"
    . "Tagline: Engineering the infrastructure behind a secure digital future.\n"
    . "Headquarters: Addis Ababa, Ethiopia\n"
    . "Specialization: Enterprise ICT solutions, system integration, cybersecurity, data center facility, cloud services, and servers & storage.\n\n"
    . "── CONTACT ──\n"
    . "Email: info@yaronengineering.com\n"
    . "Website pages: Home (/), About (/about), Services (/services), Solutions (/solutions), Industries (/industries), Projects (/projects), Partners (/partners), Careers (/careers), Contact (/contact).\n";

$contents = [];
foreach ($messages as $m) {
    $role = ($m['role'] === 'assistant') ? 'model' : 'user';
    $contents[] = [
        'role' => $role,
        'parts' => [['text' => (string)($m['content'] ?? '')]]
    ];
}

$payload = [
    'system_instruction' => ['parts' => [['text' => $systemPrompt]]],
    'contents' => $contents,
    'generationConfig' => [
        'temperature' => 0.8,
        'maxOutputTokens' => 350
    ]
];

$models = ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-3.5-flash'];
$reply = null;
$lastError = 'AI service temporarily unavailable';

foreach ($models as $model) {
    $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . urlencode($apiKey);
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $res = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $res) {
        $json = json_decode($res, true);
        $candidateText = $json['candidates'][0]['content']['parts'][0]['text'] ?? null;
        if ($candidateText) {
            $reply = $candidateText;
            break;
        }
    }
}

if ($reply) {
    echo json_encode(['reply' => $reply]);
} else {
    http_response_code(502);
    echo json_encode(['error' => $lastError]);
}
