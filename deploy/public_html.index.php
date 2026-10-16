<?php
$targetHost = '127.0.0.1';
$targetPort = 3055;
$uri = $_SERVER['REQUEST_URI'] ?? '/';
$url = "http://{$targetHost}:{$targetPort}{$uri}";
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function proxy_to_app($url, $method, $body = null) {
  $headers = [];
  foreach (getallheaders() ?: [] as $k => $v) {
    $lk = strtolower($k);
    if (in_array($lk, ['host', 'content-length', 'connection', 'accept-encoding'], true)) continue;
    $headers[] = "{$k}: {$v}";
  }
  $headers[] = 'Host: ' . ($_SERVER['HTTP_HOST'] ?? 'localhost');
  $headers[] = 'X-Forwarded-For: ' . ($_SERVER['REMOTE_ADDR'] ?? '');
  $headers[] = 'X-Forwarded-Proto: ' . ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http');
  $headers[] = 'X-Forwarded-Host: ' . ($_SERVER['HTTP_HOST'] ?? '');

  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_TIMEOUT => 120,
    CURLOPT_POSTFIELDS => $body,
  ]);
  $resp = curl_exec($ch);
  if ($resp === false) {
    $err = curl_error($ch);
    curl_close($ch);
    return [null, null, null, $err];
  }
  $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
  curl_close($ch);
  return [
    $status,
    substr($resp, 0, $headerSize),
    substr($resp, $headerSize),
    null,
  ];
}

$body = null;
if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
  $body = file_get_contents('php://input');
}

[$status, $rawHeaders, $rawBody, $err] = proxy_to_app($url, $method, $body);

// Reintento único si Node aún no respondió (p. ej. restart de PM2)
if ($err !== null || ($status === 200 && $rawBody === '' && in_array($method, ['GET', 'HEAD'], true))) {
  usleep(250000);
  [$status, $rawHeaders, $rawBody, $err] = proxy_to_app($url, $method, $body);
}

if ($err !== null || $rawHeaders === null) {
  http_response_code(502);
  header('Content-Type: text/plain; charset=utf-8');
  header('Cache-Control: no-store');
  echo "App offline (PM2 :3055).";
  exit;
}

// Nunca cachear HTML vacío en GET (HEAD es vacío a propósito y no debe ser 502)
if ($method === 'GET' && $status === 200 && $rawBody === '') {
  http_response_code(502);
  header('Content-Type: text/plain; charset=utf-8');
  header('Cache-Control: no-store');
  echo "App returned empty response.";
  exit;
}

http_response_code($status);
foreach (explode("\r\n", $rawHeaders) as $line) {
  if ($line === '' || stripos($line, 'HTTP/') === 0) continue;
  if (stripos($line, 'Transfer-Encoding:') === 0) continue;
  if (stripos($line, 'Connection:') === 0) continue;
  if (stripos($line, 'Cache-Control:') === 0) continue;
  header($line, false);
}

$ct = '';
foreach (explode("\r\n", $rawHeaders) as $line) {
  if (stripos($line, 'Content-Type:') === 0) {
    $ct = strtolower(trim(substr($line, strlen('Content-Type:'))));
    break;
  }
}
if (str_contains($ct, 'text/html') || $ct === '') {
  header('Cache-Control: private, no-cache, no-store, must-revalidate');
}

echo $rawBody;
