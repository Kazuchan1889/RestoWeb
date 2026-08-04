<?php

// Ensure Vercel environment variables fallbacks for smooth zero-config deployment
if (!getenv('APP_KEY') && !isset($_ENV['APP_KEY'])) {
    putenv('APP_KEY=base64:jf/8miNZpO28NA0ngh4JMnxmCkn580TGsEwt65MBo8w=');
    $_ENV['APP_KEY'] = 'base64:jf/8miNZpO28NA0ngh4JMnxmCkn580TGsEwt65MBo8w=';
}

if (!getenv('DB_CONNECTION') && !isset($_ENV['DB_CONNECTION'])) {
    putenv('DB_CONNECTION=pgsql');
    putenv('DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com');
    putenv('DB_PORT=5432');
    putenv('DB_DATABASE=postgres');
    putenv('DB_USERNAME=postgres.dgrsttacoivnvioifnza');
    putenv('DB_PASSWORD=q9WVQuzWsJ1zYVmg');

    $_ENV['DB_CONNECTION'] = 'pgsql';
    $_ENV['DB_HOST'] = 'aws-0-ap-southeast-1.pooler.supabase.com';
    $_ENV['DB_PORT'] = '5432';
    $_ENV['DB_DATABASE'] = 'postgres';
    $_ENV['DB_USERNAME'] = 'postgres.dgrsttacoivnvioifnza';
    $_ENV['DB_PASSWORD'] = 'q9WVQuzWsJ1zYVmg';
}

// Create writable storage paths in /tmp for Vercel serverless environment
$storageDirs = [
    '/tmp/storage/framework/views',
    '/tmp/storage/framework/cache',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/logs',
];
foreach ($storageDirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }
}

// Forward Vercel requests to Laravel entrypoint
require __DIR__ . '/../public/index.php';
