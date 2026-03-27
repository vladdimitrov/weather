<?php
$domain = "https://weatherpulse.eu";
$baseDir = __DIR__;
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($baseDir));

$urls = [];

foreach ($iterator as $file) {
    if ($file->getExtension() === 'html') {
        $filePath = str_replace($baseDir, '', $file->getPathname());
        $filePath = str_replace('\\', '/', $filePath); // за Windows
        $fileUrl = $domain . $filePath;
        $fileUrl = str_replace('/index.html', '/', $fileUrl); // премахни index.html
        $lastMod = date('Y-m-d', filemtime($file->getPathname()));

        $urls[] = [
            'loc' => $fileUrl,
            'lastmod' => $lastMod
        ];
    }
}

// Генериране на XML
$xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
$xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

foreach ($urls as $url) {
    $xml .= "  <url>\n";
    $xml .= "    <loc>{$url['loc']}</loc>\n";
    $xml .= "    <lastmod>{$url['lastmod']}</lastmod>\n";
    $xml .= "    <priority>0.8</priority>\n";
    $xml .= "  </url>\n";
}

$xml .= '</urlset>';

file_put_contents('sitemap.xml', $xml);

echo "✅ sitemap.xml генериран успешно!";
