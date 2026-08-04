<?php

// Ensure environment variables are loaded for Vercel Serverless Function
$defaultEnvs = [
    'APP_NAME' => 'RestoWeb',
    'APP_ENV' => 'production',
    'APP_KEY' => 'base64:jf/8miNZpO28NA0ngh4JMnxmCkn580TGsEwt65MBo8w=',
    'APP_DEBUG' => 'false',
    'APP_URL' => 'https://resto-web-chi.vercel.app',
    'LOG_CHANNEL' => 'stderr',
    'DB_CONNECTION' => 'pgsql',
    'DB_HOST' => 'aws-0-ap-southeast-1.pooler.supabase.com',
    'DB_PORT' => '5432',
    'DB_DATABASE' => 'postgres',
    'DB_USERNAME' => 'postgres.dgrsttacoivnvioifnza',
    'DB_PASSWORD' => 'q9WVQuzWsJ1zYVmg',
    'DB_SSLMODE' => 'prefer',
    'SESSION_DRIVER' => 'cookie',
    'CACHE_STORE' => 'array',
    'QUEUE_CONNECTION' => 'sync',
];

foreach ($defaultEnvs as $k => $v) {
    if (empty($_ENV[$k]) && empty($_SERVER[$k]) && empty(getenv($k))) {
        putenv("{$k}={$v}");
        $_ENV[$k] = $v;
        $_SERVER[$k] = $v;
    }
}

// Create writable storage directories in /tmp for Vercel serverless environment
$storageDirs = [
    '/tmp/storage/framework/views',
    '/tmp/storage/framework/cache',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/logs',
    '/tmp/database',
];
foreach ($storageDirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }
}

if (!file_exists(__DIR__ . '/../vendor/autoload.php')) {
    http_response_code(500);
    echo "<h1>Vercel Deployment Error</h1>";
    echo "<p><code>vendor/autoload.php</code> not found.</p>";
    exit(1);
}

try {
    require __DIR__ . '/../public/index.php';
} catch (\Throwable $e) {
    http_response_code(500);
    echo "<h1>Laravel Boot Exception (500)</h1>";
    echo "<p><strong>Message:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p><strong>File:</strong> " . htmlspecialchars($e->getFile()) . " (Line " . $e->getLine() . ")</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}
