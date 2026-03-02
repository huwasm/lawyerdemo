➜  ~ curl -s "https://eu.app.clio.com/api/v4/documents?fields=id,name,latest_document_version&matter_id=14537825" \
  -H "Authorization: Bearer 4100-AG4QXLlqfZeQnba00GNqiQirGbSvuqBTLPT" | python3 -m json.tool

{
    "meta": {
        "paging": {},
        "records": 3
    },
    "data": [
        {
            "id": 777403100,
            "name": "Retainer_Agreement_CASTILLO.pdf",
            "latest_document_version": {
                "id": 761805707,
                "version_number": 1
            }
        },
        {
            "id": 777441611,
            "name": "Retainer_Agreement_CASTILLO.pdf",
            "latest_document_version": {
                "id": 761844086,
                "version_number": 1
            }
        },
        {
            "id": 777498182,
            "name": "Retainer_Agreement_CASTILLO.pdf",
            "latest_document_version": {
                "id": 761899658,
                "version_number": 1
            }
        }
    ]
}
➜  ~ curl -s "https://eu.app.clio.com/api/v4/documents/777441611?fields=id,name,latest_document_version" \
  -H "Authorization: Bearer 4100-AG4QXLlqfZeQnba00GNqiQirGbSvuqBTLPT" | python3 -m json.tool

{
    "data": {
        "id": 777441611,
        "name": "Retainer_Agreement_CASTILLO.pdf",
        "latest_document_version": {
            "id": 761844086,
            "version_number": 1
        }
    }
}
➜  ~ curl -v "https://eu.app.clio.com/api/v4/document_versions/VERSION_ID/download" \
  -H "Authorization: Bearer 4100-AG4QXLlqfZeQnba00GNqiQirGbSvuqBTLPT" \
  -o /tmp/retainer_test.pdf

  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0* Host eu.app.clio.com:443 was resolved.
* IPv6: (none)
* IPv4: 52.215.173.134, 108.129.31.145, 34.254.44.58
*   Trying 52.215.173.134:443...
* Connected to eu.app.clio.com (52.215.173.134) port 443
* ALPN: curl offers h2,http/1.1
* (304) (OUT), TLS handshake, Client hello (1):
} [320 bytes data]
*  CAfile: /etc/ssl/cert.pem
*  CApath: none
* (304) (IN), TLS handshake, Server hello (2):
{ [91 bytes data]
* TLSv1.2 (IN), TLS handshake, Certificate (11):
{ [3910 bytes data]
* TLSv1.2 (IN), TLS handshake, Server key exchange (12):
{ [333 bytes data]
* TLSv1.2 (IN), TLS handshake, Server finished (14):
{ [4 bytes data]
* TLSv1.2 (OUT), TLS handshake, Client key exchange (16):
} [70 bytes data]
* TLSv1.2 (OUT), TLS change cipher, Change cipher spec (1):
} [1 bytes data]
* TLSv1.2 (OUT), TLS handshake, Finished (20):
} [16 bytes data]
* TLSv1.2 (IN), TLS change cipher, Change cipher spec (1):
{ [1 bytes data]
* TLSv1.2 (IN), TLS handshake, Finished (20):
{ [16 bytes data]
* SSL connection using TLSv1.2 / ECDHE-RSA-AES128-GCM-SHA256 / [blank] / UNDEF
* ALPN: server did not agree on a protocol. Uses default.
* Server certificate:
*  subject: CN=eu.app.clio.com
*  start date: Jan  6 00:00:00 2026 GMT
*  expire date: Feb  4 23:59:59 2027 GMT
*  subjectAltName: host "eu.app.clio.com" matched cert's "eu.app.clio.com"
*  issuer: C=US; O=Amazon; CN=Amazon RSA 2048 M04
*  SSL certificate verify ok.
* using HTTP/1.x
> GET /api/v4/document_versions/VERSION_ID/download HTTP/1.1
> Host: eu.app.clio.com
> User-Agent: curl/8.7.1
> Accept: */*
> Authorization: Bearer 4100-AG4QXLlqfZeQnba00GNqiQirGbSvuqBTLPT
> 
* Request completely sent off
< HTTP/1.1 404 Not Found
< Date: Mon, 02 Mar 2026 05:32:44 GMT
< Content-Type: text/html; charset=utf-8
< Content-Length: 23741
< Connection: keep-alive
< Server: nginx
< Vary: Accept-Encoding
< X-Request-Id: 8cb4fee5-4b16-49cc-b77d-4063055c6498
< Strict-Transport-Security: max-age=63072000
< Vary: Origin
< X-Frame-Options: SAMEORIGIN
< X-Content-Type-Options: nosniff
< X-XSS-Protection: 1; mode=block
< Content-Security-Policy: default-src * 'unsafe-inline'; base-uri 'self'; connect-src * data: blob:; font-src * data:; frame-ancestors 'self' app.eu.pendo.io *.office.com *.office365.com *.live.com outlook.cloud.microsoft teams.cloud.microsoft grow.clio.com au.grow.clio.com ca.grow.clio.com eu.grow.clio.com spm.grow.clio.com; frame-src 'self' *.app.clio.com app.clio.com kit.fontawesome.com api.segment.io app.eu.pendo.io cdn.affinipay.com cdn.eu.pendo.io cdn.jsdelivr.net cdn.plaid.com cdn.segment.com clio.uservoice.com connect.facebook.net data.eu.pendo.io fast.wistia.com *.sentry-cdn.com fonts.gstatic.com googleads.g.doubleclick.net js.navattic.com js.stripe.com munchkin.marketo.net pendo-eu-extensions.storage.googleapis.com pendo-eu-static.storage.googleapis.com pendo-eu-static-5065845963096064.storage.googleapis.com privacy-policy.truste.com player.vimeo.com recaptcha.google.com/recaptcha/ snap.licdn.com static.zdassets.com stats.g.doubleclick.net chat.onmaven.app *.qualtrics.com feedback.clio.com themis-solutions.my.site.com themis-solutions--engteam.sandbox.my.site.com themis-solutions--full.sandbox.my.site.com themis-solutions--lvb.sandbox.my.site.com themis-solutions--service.sandbox.my.site.com themis-solutions--staging.sandbox.my.site.com themis-solutions.my.salesforce-scrt.com themis-solutions--engteam.sandbox.my.salesforce-scrt.com themis-solutions--full.sandbox.my.salesforce-scrt.com themis-solutions--lvb.sandbox.my.salesforce-scrt.com themis-solutions--service.sandbox.my.salesforce-scrt.com themis-solutions--staging.sandbox.my.salesforce-scrt.com widget-mediator.zopim.com www.googleadservices.com www.googletagmanager.com www.google.com/recaptcha/ www.gstatic.com/recaptcha/ d384xlc27tuqx4.cloudfront.net d16fnvcdkazl6d.cloudfront.net d1z9ara1acwrvo.cloudfront.net d2jai5xo6vhevf.cloudfront.net d3br3kdz453vlv.cloudfront.net d3erqgaey65nt8.cloudfront.net stackpath.bootstrapcdn.com appsforoffice.microsoft.com ajax.aspnetcdn.com login.microsoftonline.com waconatm.officeapps.live.com *.vlex.com *.netdocuments.app account.clio.com accounts.google.com app.box.com bid.g.doubleclick.net billing.clio.com capture.navattic.com embedded.hellosign.com fast.wistia.net www.facebook.com private-clio-demo.onmaven.app payments.clio.com *.payments.clio.com service-bucket-ruby.prod-us-a.clio.services service-bucket-ruby.prod-eu-a.clio.services service-bucket-ruby.prod-ca-a.clio.services service-bucket-ruby.prod-au-a.clio.services service-bucket-ruby.staging-us-a.clio.services clio-manage-prod-au-a-documents.s3.ap-southeast-2.amazonaws.com clio-manage-prod-au-a-temporary.s3.ap-southeast-2.amazonaws.com clio-manage-prod-ca-a-documents.s3.ca-central-1.amazonaws.com clio-manage-prod-ca-a-temporary.s3.ca-central-1.amazonaws.com iris-production.s3.us-east-1.amazonaws.com iris-production-eu.s3.eu-west-1.amazonaws.com s3.ap-southeast-2.amazonaws.com/clio-manage-prod-au-a-temporary/ s3.ca-central-1.amazonaws.com/clio-manage-prod-ca-a-temporary/ s3.eu-west-1.amazonaws.com/temporary.goclio.eu/ s3.amazonaws.com/clio-manage-prod-au-a-application-objects/ s3.amazonaws.com/clio-manage-prod-ca-a-application-objects/ s3.amazonaws.com/documents.goclio.com/ s3.amazonaws.com/documents.goclio.eu/ s3.amazonaws.com/clio-manage-staging-us-a-application-objects/ s3.us-east-1.amazonaws.com/cdn.hellosign.com/ s3.us-east-1.amazonaws.com/temporary.goclio.com/ s3.amazonaws.com/temporary.goclio.com/ stripe-data-exports.s3.amazonaws.com; img-src * data: blob:; media-src blob: https:; object-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'report-sample' blob: *.app.clio.com app.clio.com kit.fontawesome.com api.segment.io app.eu.pendo.io cdn.affinipay.com cdn.eu.pendo.io cdn.jsdelivr.net cdn.plaid.com cdn.segment.com clio.uservoice.com connect.facebook.net data.eu.pendo.io fast.wistia.com *.sentry-cdn.com fonts.gstatic.com googleads.g.doubleclick.net js.navattic.com js.stripe.com munchkin.marketo.net pendo-eu-extensions.storage.googleapis.com pendo-eu-static.storage.googleapis.com pendo-eu-static-5065845963096064.storage.googleapis.com privacy-policy.truste.com player.vimeo.com recaptcha.google.com/recaptcha/ snap.licdn.com static.zdassets.com stats.g.doubleclick.net chat.onmaven.app *.qualtrics.com feedback.clio.com themis-solutions.my.site.com themis-solutions--engteam.sandbox.my.site.com themis-solutions--full.sandbox.my.site.com themis-solutions--lvb.sandbox.my.site.com themis-solutions--service.sandbox.my.site.com themis-solutions--staging.sandbox.my.site.com themis-solutions.my.salesforce-scrt.com themis-solutions--engteam.sandbox.my.salesforce-scrt.com themis-solutions--full.sandbox.my.salesforce-scrt.com themis-solutions--lvb.sandbox.my.salesforce-scrt.com themis-solutions--service.sandbox.my.salesforce-scrt.com themis-solutions--staging.sandbox.my.salesforce-scrt.com widget-mediator.zopim.com www.googleadservices.com www.googletagmanager.com www.google.com/recaptcha/ www.gstatic.com/recaptcha/ d384xlc27tuqx4.cloudfront.net d16fnvcdkazl6d.cloudfront.net d1z9ara1acwrvo.cloudfront.net d2jai5xo6vhevf.cloudfront.net d3br3kdz453vlv.cloudfront.net d3erqgaey65nt8.cloudfront.net stackpath.bootstrapcdn.com appsforoffice.microsoft.com ajax.aspnetcdn.com login.microsoftonline.com waconatm.officeapps.live.com *.vlex.com *.netdocuments.app; style-src 'self' https: 'unsafe-inline' 'report-sample'; worker-src 'self' blob:; report-uri https://browser-intake-datadoghq.com/api/v2/logs?dd-api-key=pubc1819cb090e45b9e9d8190699a1cf908&dd-evp-origin=content-security-policy&ddsource=csp-report&ddtags=service%3Amanage%2Cenv%3Aproduction-eu
< 
{ [10394 bytes data]
100 23741  100 23741    0     0   101k      0 --:--:-- --:--:-- --:--:--  102k
* Connection #0 to host eu.app.clio.com left intact
➜  ~ 




  ~ curl -v "https://eu.app.clio.com/api/v4/document_versions/761844086/download" \
  -H "Authorization: Bearer 4100-AG4QXLlqfZeQnba00GNqiQirGbSvuqBTLPT" \
  -o /tmp/retainer_test.pdf

  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0* Host eu.app.clio.com:443 was resolved.
* IPv6: (none)
* IPv4: 34.254.44.58, 108.129.31.145, 52.215.173.134
*   Trying 34.254.44.58:443...
* Connected to eu.app.clio.com (34.254.44.58) port 443
* ALPN: curl offers h2,http/1.1
* (304) (OUT), TLS handshake, Client hello (1):
} [320 bytes data]
*  CAfile: /etc/ssl/cert.pem
*  CApath: none
* (304) (IN), TLS handshake, Server hello (2):
{ [91 bytes data]
* TLSv1.2 (IN), TLS handshake, Certificate (11):
{ [3910 bytes data]
* TLSv1.2 (IN), TLS handshake, Server key exchange (12):
{ [333 bytes data]
* TLSv1.2 (IN), TLS handshake, Server finished (14):
{ [4 bytes data]
* TLSv1.2 (OUT), TLS handshake, Client key exchange (16):
} [70 bytes data]
* TLSv1.2 (OUT), TLS change cipher, Change cipher spec (1):
} [1 bytes data]
* TLSv1.2 (OUT), TLS handshake, Finished (20):
} [16 bytes data]
* TLSv1.2 (IN), TLS change cipher, Change cipher spec (1):
{ [1 bytes data]
* TLSv1.2 (IN), TLS handshake, Finished (20):
{ [16 bytes data]
* SSL connection using TLSv1.2 / ECDHE-RSA-AES128-GCM-SHA256 / [blank] / UNDEF
* ALPN: server did not agree on a protocol. Uses default.
* Server certificate:
*  subject: CN=eu.app.clio.com
*  start date: Jan  6 00:00:00 2026 GMT
*  expire date: Feb  4 23:59:59 2027 GMT
*  subjectAltName: host "eu.app.clio.com" matched cert's "eu.app.clio.com"
*  issuer: C=US; O=Amazon; CN=Amazon RSA 2048 M04
*  SSL certificate verify ok.
* using HTTP/1.x
> GET /api/v4/document_versions/761844086/download HTTP/1.1
> Host: eu.app.clio.com
> User-Agent: curl/8.7.1
> Accept: */*
> Authorization: Bearer 4100-AG4QXLlqfZeQnba00GNqiQirGbSvuqBTLPT
> 
* Request completely sent off
< HTTP/1.1 404 Not Found
< Date: Mon, 02 Mar 2026 05:35:02 GMT
< Content-Type: text/html; charset=utf-8
< Content-Length: 23741
< Connection: keep-alive
< Server: nginx
< Vary: Accept-Encoding
< X-Request-Id: ab027106-6b6d-4539-b9b6-43b68cab8794
< Strict-Transport-Security: max-age=63072000
< Vary: Origin
< X-Frame-Options: SAMEORIGIN
< X-Content-Type-Options: nosniff
< X-XSS-Protection: 1; mode=block
< Content-Security-Policy: default-src * 'unsafe-inline'; base-uri 'self'; connect-src * data: blob:; font-src * data:; frame-ancestors 'self' app.eu.pendo.io *.office.com *.office365.com *.live.com outlook.cloud.microsoft teams.cloud.microsoft grow.clio.com au.grow.clio.com ca.grow.clio.com eu.grow.clio.com spm.grow.clio.com; frame-src 'self' *.app.clio.com app.clio.com kit.fontawesome.com api.segment.io app.eu.pendo.io cdn.affinipay.com cdn.eu.pendo.io cdn.jsdelivr.net cdn.plaid.com cdn.segment.com clio.uservoice.com connect.facebook.net data.eu.pendo.io fast.wistia.com *.sentry-cdn.com fonts.gstatic.com googleads.g.doubleclick.net js.navattic.com js.stripe.com munchkin.marketo.net pendo-eu-extensions.storage.googleapis.com pendo-eu-static.storage.googleapis.com pendo-eu-static-5065845963096064.storage.googleapis.com privacy-policy.truste.com player.vimeo.com recaptcha.google.com/recaptcha/ snap.licdn.com static.zdassets.com stats.g.doubleclick.net chat.onmaven.app *.qualtrics.com feedback.clio.com themis-solutions.my.site.com themis-solutions--engteam.sandbox.my.site.com themis-solutions--full.sandbox.my.site.com themis-solutions--lvb.sandbox.my.site.com themis-solutions--service.sandbox.my.site.com themis-solutions--staging.sandbox.my.site.com themis-solutions.my.salesforce-scrt.com themis-solutions--engteam.sandbox.my.salesforce-scrt.com themis-solutions--full.sandbox.my.salesforce-scrt.com themis-solutions--lvb.sandbox.my.salesforce-scrt.com themis-solutions--service.sandbox.my.salesforce-scrt.com themis-solutions--staging.sandbox.my.salesforce-scrt.com widget-mediator.zopim.com www.googleadservices.com www.googletagmanager.com www.google.com/recaptcha/ www.gstatic.com/recaptcha/ d384xlc27tuqx4.cloudfront.net d16fnvcdkazl6d.cloudfront.net d1z9ara1acwrvo.cloudfront.net d2jai5xo6vhevf.cloudfront.net d3br3kdz453vlv.cloudfront.net d3erqgaey65nt8.cloudfront.net stackpath.bootstrapcdn.com appsforoffice.microsoft.com ajax.aspnetcdn.com login.microsoftonline.com waconatm.officeapps.live.com *.vlex.com *.netdocuments.app account.clio.com accounts.google.com app.box.com bid.g.doubleclick.net billing.clio.com capture.navattic.com embedded.hellosign.com fast.wistia.net www.facebook.com private-clio-demo.onmaven.app payments.clio.com *.payments.clio.com service-bucket-ruby.prod-us-a.clio.services service-bucket-ruby.prod-eu-a.clio.services service-bucket-ruby.prod-ca-a.clio.services service-bucket-ruby.prod-au-a.clio.services service-bucket-ruby.staging-us-a.clio.services clio-manage-prod-au-a-documents.s3.ap-southeast-2.amazonaws.com clio-manage-prod-au-a-temporary.s3.ap-southeast-2.amazonaws.com clio-manage-prod-ca-a-documents.s3.ca-central-1.amazonaws.com clio-manage-prod-ca-a-temporary.s3.ca-central-1.amazonaws.com iris-production.s3.us-east-1.amazonaws.com iris-production-eu.s3.eu-west-1.amazonaws.com s3.ap-southeast-2.amazonaws.com/clio-manage-prod-au-a-temporary/ s3.ca-central-1.amazonaws.com/clio-manage-prod-ca-a-temporary/ s3.eu-west-1.amazonaws.com/temporary.goclio.eu/ s3.amazonaws.com/clio-manage-prod-au-a-application-objects/ s3.amazonaws.com/clio-manage-prod-ca-a-application-objects/ s3.amazonaws.com/documents.goclio.com/ s3.amazonaws.com/documents.goclio.eu/ s3.amazonaws.com/clio-manage-staging-us-a-application-objects/ s3.us-east-1.amazonaws.com/cdn.hellosign.com/ s3.us-east-1.amazonaws.com/temporary.goclio.com/ s3.amazonaws.com/temporary.goclio.com/ stripe-data-exports.s3.amazonaws.com; img-src * data: blob:; media-src blob: https:; object-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'report-sample' blob: *.app.clio.com app.clio.com kit.fontawesome.com api.segment.io app.eu.pendo.io cdn.affinipay.com cdn.eu.pendo.io cdn.jsdelivr.net cdn.plaid.com cdn.segment.com clio.uservoice.com connect.facebook.net data.eu.pendo.io fast.wistia.com *.sentry-cdn.com fonts.gstatic.com googleads.g.doubleclick.net js.navattic.com js.stripe.com munchkin.marketo.net pendo-eu-extensions.storage.googleapis.com pendo-eu-static.storage.googleapis.com pendo-eu-static-5065845963096064.storage.googleapis.com privacy-policy.truste.com player.vimeo.com recaptcha.google.com/recaptcha/ snap.licdn.com static.zdassets.com stats.g.doubleclick.net chat.onmaven.app *.qualtrics.com feedback.clio.com themis-solutions.my.site.com themis-solutions--engteam.sandbox.my.site.com themis-solutions--full.sandbox.my.site.com themis-solutions--lvb.sandbox.my.site.com themis-solutions--service.sandbox.my.site.com themis-solutions--staging.sandbox.my.site.com themis-solutions.my.salesforce-scrt.com themis-solutions--engteam.sandbox.my.salesforce-scrt.com themis-solutions--full.sandbox.my.salesforce-scrt.com themis-solutions--lvb.sandbox.my.salesforce-scrt.com themis-solutions--service.sandbox.my.salesforce-scrt.com themis-solutions--staging.sandbox.my.salesforce-scrt.com widget-mediator.zopim.com www.googleadservices.com www.googletagmanager.com www.google.com/recaptcha/ www.gstatic.com/recaptcha/ d384xlc27tuqx4.cloudfront.net d16fnvcdkazl6d.cloudfront.net d1z9ara1acwrvo.cloudfront.net d2jai5xo6vhevf.cloudfront.net d3br3kdz453vlv.cloudfront.net d3erqgaey65nt8.cloudfront.net stackpath.bootstrapcdn.com appsforoffice.microsoft.com ajax.aspnetcdn.com login.microsoftonline.com waconatm.officeapps.live.com *.vlex.com *.netdocuments.app; style-src 'self' https: 'unsafe-inline' 'report-sample'; worker-src 'self' blob:; report-uri https://browser-intake-datadoghq.com/api/v2/logs?dd-api-key=pubc1819cb090e45b9e9d8190699a1cf908&dd-evp-origin=content-security-policy&ddsource=csp-report&ddtags=service%3Amanage%2Cenv%3Aproduction-eu
< 
{ [10394 bytes data]
100 23741  100 23741    0     0   102k      0 --:--:-- --:--:-- --:--:--  103k
* Connection #0 to host eu.app.clio.com left intact
➜  ~ curl -v "https://eu.app.clio.com/api/v4/document_versions/761805707/download" \
  -H "Authorization: Bearer 4100-AG4QXLlqfZeQnba00GNqiQirGbSvuqBTLPT" \
  -o /tmp/retainer_test_old.pdf

  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0* Host eu.app.clio.com:443 was resolved.
* IPv6: (none)
* IPv4: 108.129.31.145, 34.254.44.58, 52.215.173.134
*   Trying 108.129.31.145:443...
* Connected to eu.app.clio.com (108.129.31.145) port 443
* ALPN: curl offers h2,http/1.1
* (304) (OUT), TLS handshake, Client hello (1):
} [320 bytes data]
*  CAfile: /etc/ssl/cert.pem
*  CApath: none
* (304) (IN), TLS handshake, Server hello (2):
{ [91 bytes data]
* TLSv1.2 (IN), TLS handshake, Certificate (11):
{ [3910 bytes data]
* TLSv1.2 (IN), TLS handshake, Server key exchange (12):
{ [333 bytes data]
* TLSv1.2 (IN), TLS handshake, Server finished (14):
{ [4 bytes data]
* TLSv1.2 (OUT), TLS handshake, Client key exchange (16):
} [70 bytes data]
* TLSv1.2 (OUT), TLS change cipher, Change cipher spec (1):
} [1 bytes data]
* TLSv1.2 (OUT), TLS handshake, Finished (20):
} [16 bytes data]
* TLSv1.2 (IN), TLS change cipher, Change cipher spec (1):
{ [1 bytes data]
* TLSv1.2 (IN), TLS handshake, Finished (20):
{ [16 bytes data]
* SSL connection using TLSv1.2 / ECDHE-RSA-AES128-GCM-SHA256 / [blank] / UNDEF
* ALPN: server did not agree on a protocol. Uses default.
* Server certificate:
*  subject: CN=eu.app.clio.com
*  start date: Jan  6 00:00:00 2026 GMT
*  expire date: Feb  4 23:59:59 2027 GMT
*  subjectAltName: host "eu.app.clio.com" matched cert's "eu.app.clio.com"
*  issuer: C=US; O=Amazon; CN=Amazon RSA 2048 M04
*  SSL certificate verify ok.
* using HTTP/1.x
> GET /api/v4/document_versions/761805707/download HTTP/1.1
> Host: eu.app.clio.com
> User-Agent: curl/8.7.1
> Accept: */*
> Authorization: Bearer 4100-AG4QXLlqfZeQnba00GNqiQirGbSvuqBTLPT
> 
* Request completely sent off
< HTTP/1.1 404 Not Found
< Date: Mon, 02 Mar 2026 05:35:22 GMT
< Content-Type: text/html; charset=utf-8
< Content-Length: 23741
< Connection: keep-alive
< Server: nginx
< Vary: Accept-Encoding
< X-Request-Id: ca5b04f8-7e60-4222-b148-ab19cb440456
< Strict-Transport-Security: max-age=63072000
< Vary: Origin
< X-Frame-Options: SAMEORIGIN
< X-Content-Type-Options: nosniff
< X-XSS-Protection: 1; mode=block
< Content-Security-Policy: default-src * 'unsafe-inline'; base-uri 'self'; connect-src * data: blob:; font-src * data:; frame-ancestors 'self' app.eu.pendo.io *.office.com *.office365.com *.live.com outlook.cloud.microsoft teams.cloud.microsoft grow.clio.com au.grow.clio.com ca.grow.clio.com eu.grow.clio.com spm.grow.clio.com; frame-src 'self' *.app.clio.com app.clio.com kit.fontawesome.com api.segment.io app.eu.pendo.io cdn.affinipay.com cdn.eu.pendo.io cdn.jsdelivr.net cdn.plaid.com cdn.segment.com clio.uservoice.com connect.facebook.net data.eu.pendo.io fast.wistia.com *.sentry-cdn.com fonts.gstatic.com googleads.g.doubleclick.net js.navattic.com js.stripe.com munchkin.marketo.net pendo-eu-extensions.storage.googleapis.com pendo-eu-static.storage.googleapis.com pendo-eu-static-5065845963096064.storage.googleapis.com privacy-policy.truste.com player.vimeo.com recaptcha.google.com/recaptcha/ snap.licdn.com static.zdassets.com stats.g.doubleclick.net chat.onmaven.app *.qualtrics.com feedback.clio.com themis-solutions.my.site.com themis-solutions--engteam.sandbox.my.site.com themis-solutions--full.sandbox.my.site.com themis-solutions--lvb.sandbox.my.site.com themis-solutions--service.sandbox.my.site.com themis-solutions--staging.sandbox.my.site.com themis-solutions.my.salesforce-scrt.com themis-solutions--engteam.sandbox.my.salesforce-scrt.com themis-solutions--full.sandbox.my.salesforce-scrt.com themis-solutions--lvb.sandbox.my.salesforce-scrt.com themis-solutions--service.sandbox.my.salesforce-scrt.com themis-solutions--staging.sandbox.my.salesforce-scrt.com widget-mediator.zopim.com www.googleadservices.com www.googletagmanager.com www.google.com/recaptcha/ www.gstatic.com/recaptcha/ d384xlc27tuqx4.cloudfront.net d16fnvcdkazl6d.cloudfront.net d1z9ara1acwrvo.cloudfront.net d2jai5xo6vhevf.cloudfront.net d3br3kdz453vlv.cloudfront.net d3erqgaey65nt8.cloudfront.net stackpath.bootstrapcdn.com appsforoffice.microsoft.com ajax.aspnetcdn.com login.microsoftonline.com waconatm.officeapps.live.com *.vlex.com *.netdocuments.app account.clio.com accounts.google.com app.box.com bid.g.doubleclick.net billing.clio.com capture.navattic.com embedded.hellosign.com fast.wistia.net www.facebook.com private-clio-demo.onmaven.app payments.clio.com *.payments.clio.com service-bucket-ruby.prod-us-a.clio.services service-bucket-ruby.prod-eu-a.clio.services service-bucket-ruby.prod-ca-a.clio.services service-bucket-ruby.prod-au-a.clio.services service-bucket-ruby.staging-us-a.clio.services clio-manage-prod-au-a-documents.s3.ap-southeast-2.amazonaws.com clio-manage-prod-au-a-temporary.s3.ap-southeast-2.amazonaws.com clio-manage-prod-ca-a-documents.s3.ca-central-1.amazonaws.com clio-manage-prod-ca-a-temporary.s3.ca-central-1.amazonaws.com iris-production.s3.us-east-1.amazonaws.com iris-production-eu.s3.eu-west-1.amazonaws.com s3.ap-southeast-2.amazonaws.com/clio-manage-prod-au-a-temporary/ s3.ca-central-1.amazonaws.com/clio-manage-prod-ca-a-temporary/ s3.eu-west-1.amazonaws.com/temporary.goclio.eu/ s3.amazonaws.com/clio-manage-prod-au-a-application-objects/ s3.amazonaws.com/clio-manage-prod-ca-a-application-objects/ s3.amazonaws.com/documents.goclio.com/ s3.amazonaws.com/documents.goclio.eu/ s3.amazonaws.com/clio-manage-staging-us-a-application-objects/ s3.us-east-1.amazonaws.com/cdn.hellosign.com/ s3.us-east-1.amazonaws.com/temporary.goclio.com/ s3.amazonaws.com/temporary.goclio.com/ stripe-data-exports.s3.amazonaws.com; img-src * data: blob:; media-src blob: https:; object-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'report-sample' blob: *.app.clio.com app.clio.com kit.fontawesome.com api.segment.io app.eu.pendo.io cdn.affinipay.com cdn.eu.pendo.io cdn.jsdelivr.net cdn.plaid.com cdn.segment.com clio.uservoice.com connect.facebook.net data.eu.pendo.io fast.wistia.com *.sentry-cdn.com fonts.gstatic.com googleads.g.doubleclick.net js.navattic.com js.stripe.com munchkin.marketo.net pendo-eu-extensions.storage.googleapis.com pendo-eu-static.storage.googleapis.com pendo-eu-static-5065845963096064.storage.googleapis.com privacy-policy.truste.com player.vimeo.com recaptcha.google.com/recaptcha/ snap.licdn.com static.zdassets.com stats.g.doubleclick.net chat.onmaven.app *.qualtrics.com feedback.clio.com themis-solutions.my.site.com themis-solutions--engteam.sandbox.my.site.com themis-solutions--full.sandbox.my.site.com themis-solutions--lvb.sandbox.my.site.com themis-solutions--service.sandbox.my.site.com themis-solutions--staging.sandbox.my.site.com themis-solutions.my.salesforce-scrt.com themis-solutions--engteam.sandbox.my.salesforce-scrt.com themis-solutions--full.sandbox.my.salesforce-scrt.com themis-solutions--lvb.sandbox.my.salesforce-scrt.com themis-solutions--service.sandbox.my.salesforce-scrt.com themis-solutions--staging.sandbox.my.salesforce-scrt.com widget-mediator.zopim.com www.googleadservices.com www.googletagmanager.com www.google.com/recaptcha/ www.gstatic.com/recaptcha/ d384xlc27tuqx4.cloudfront.net d16fnvcdkazl6d.cloudfront.net d1z9ara1acwrvo.cloudfront.net d2jai5xo6vhevf.cloudfront.net d3br3kdz453vlv.cloudfront.net d3erqgaey65nt8.cloudfront.net stackpath.bootstrapcdn.com appsforoffice.microsoft.com ajax.aspnetcdn.com login.microsoftonline.com waconatm.officeapps.live.com *.vlex.com *.netdocuments.app; style-src 'self' https: 'unsafe-inline' 'report-sample'; worker-src 'self' blob:; report-uri https://browser-intake-datadoghq.com/api/v2/logs?dd-api-key=pubc1819cb090e45b9e9d8190699a1cf908&dd-evp-origin=content-security-policy&ddsource=csp-report&ddtags=service%3Amanage%2Cenv%3Aproduction-eu
< 
{ [8949 bytes data]
100 23741  100 23741    0     0   118k      0 --:--:-- --:--:-- --:--:--  118k
* Connection #0 to host eu.app.clio.com left intact
➜  ~ 




* Connection #0 to host eu.app.clio.com left intact
➜  ~ curl -v "https://eu.app.clio.com/api/v4/document_versions/761844086/download" \
  -H "Authorization: Bearer 4100-zGWhnZQiQAaQFaWD2a72qKeEWRYI3h0tkpA" \
  -o /tmp/retainer_test.pdf

  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0* Host eu.app.clio.com:443 was resolved.
* IPv6: (none)
* IPv4: 34.254.44.58, 52.215.173.134, 108.129.31.145
*   Trying 34.254.44.58:443...
* Connected to eu.app.clio.com (34.254.44.58) port 443
* ALPN: curl offers h2,http/1.1
* (304) (OUT), TLS handshake, Client hello (1):
} [320 bytes data]
*  CAfile: /etc/ssl/cert.pem
*  CApath: none
* (304) (IN), TLS handshake, Server hello (2):
{ [91 bytes data]
* TLSv1.2 (IN), TLS handshake, Certificate (11):
{ [3910 bytes data]
* TLSv1.2 (IN), TLS handshake, Server key exchange (12):
{ [333 bytes data]
* TLSv1.2 (IN), TLS handshake, Server finished (14):
{ [4 bytes data]
* TLSv1.2 (OUT), TLS handshake, Client key exchange (16):
} [70 bytes data]
* TLSv1.2 (OUT), TLS change cipher, Change cipher spec (1):
} [1 bytes data]
* TLSv1.2 (OUT), TLS handshake, Finished (20):
} [16 bytes data]
* TLSv1.2 (IN), TLS change cipher, Change cipher spec (1):
{ [1 bytes data]
* TLSv1.2 (IN), TLS handshake, Finished (20):
{ [16 bytes data]
* SSL connection using TLSv1.2 / ECDHE-RSA-AES128-GCM-SHA256 / [blank] / UNDEF
* ALPN: server did not agree on a protocol. Uses default.
* Server certificate:
*  subject: CN=eu.app.clio.com
*  start date: Jan  6 00:00:00 2026 GMT
*  expire date: Feb  4 23:59:59 2027 GMT
*  subjectAltName: host "eu.app.clio.com" matched cert's "eu.app.clio.com"
*  issuer: C=US; O=Amazon; CN=Amazon RSA 2048 M04
*  SSL certificate verify ok.
* using HTTP/1.x
> GET /api/v4/document_versions/761844086/download HTTP/1.1
> Host: eu.app.clio.com
> User-Agent: curl/8.7.1
> Accept: */*
> Authorization: Bearer 4100-zGWhnZQiQAaQFaWD2a72qKeEWRYI3h0tkpA
> 
* Request completely sent off
< HTTP/1.1 404 Not Found
< Date: Mon, 02 Mar 2026 05:56:22 GMT
< Content-Type: text/html; charset=utf-8
< Content-Length: 23741
< Connection: keep-alive
< Server: nginx
< Vary: Accept-Encoding
< X-Request-Id: 9f28c48f-2f96-4115-8cad-e2f97a3c3c2f
< Strict-Transport-Security: max-age=63072000
< Vary: Origin
< X-Frame-Options: SAMEORIGIN
< X-Content-Type-Options: nosniff
< X-XSS-Protection: 1; mode=block
< Content-Security-Policy: default-src * 'unsafe-inline'; base-uri 'self'; connect-src * data: blob:; font-src * data:; frame-ancestors 'self' app.eu.pendo.io *.office.com *.office365.com *.live.com outlook.cloud.microsoft teams.cloud.microsoft grow.clio.com au.grow.clio.com ca.grow.clio.com eu.grow.clio.com spm.grow.clio.com; frame-src 'self' *.app.clio.com app.clio.com kit.fontawesome.com api.segment.io app.eu.pendo.io cdn.affinipay.com cdn.eu.pendo.io cdn.jsdelivr.net cdn.plaid.com cdn.segment.com clio.uservoice.com connect.facebook.net data.eu.pendo.io fast.wistia.com *.sentry-cdn.com fonts.gstatic.com googleads.g.doubleclick.net js.navattic.com js.stripe.com munchkin.marketo.net pendo-eu-extensions.storage.googleapis.com pendo-eu-static.storage.googleapis.com pendo-eu-static-5065845963096064.storage.googleapis.com privacy-policy.truste.com player.vimeo.com recaptcha.google.com/recaptcha/ snap.licdn.com static.zdassets.com stats.g.doubleclick.net chat.onmaven.app *.qualtrics.com feedback.clio.com themis-solutions.my.site.com themis-solutions--engteam.sandbox.my.site.com themis-solutions--full.sandbox.my.site.com themis-solutions--lvb.sandbox.my.site.com themis-solutions--service.sandbox.my.site.com themis-solutions--staging.sandbox.my.site.com themis-solutions.my.salesforce-scrt.com themis-solutions--engteam.sandbox.my.salesforce-scrt.com themis-solutions--full.sandbox.my.salesforce-scrt.com themis-solutions--lvb.sandbox.my.salesforce-scrt.com themis-solutions--service.sandbox.my.salesforce-scrt.com themis-solutions--staging.sandbox.my.salesforce-scrt.com widget-mediator.zopim.com www.googleadservices.com www.googletagmanager.com www.google.com/recaptcha/ www.gstatic.com/recaptcha/ d384xlc27tuqx4.cloudfront.net d16fnvcdkazl6d.cloudfront.net d1z9ara1acwrvo.cloudfront.net d2jai5xo6vhevf.cloudfront.net d3br3kdz453vlv.cloudfront.net d3erqgaey65nt8.cloudfront.net stackpath.bootstrapcdn.com appsforoffice.microsoft.com ajax.aspnetcdn.com login.microsoftonline.com waconatm.officeapps.live.com *.vlex.com *.netdocuments.app account.clio.com accounts.google.com app.box.com bid.g.doubleclick.net billing.clio.com capture.navattic.com embedded.hellosign.com fast.wistia.net www.facebook.com private-clio-demo.onmaven.app payments.clio.com *.payments.clio.com service-bucket-ruby.prod-us-a.clio.services service-bucket-ruby.prod-eu-a.clio.services service-bucket-ruby.prod-ca-a.clio.services service-bucket-ruby.prod-au-a.clio.services service-bucket-ruby.staging-us-a.clio.services clio-manage-prod-au-a-documents.s3.ap-southeast-2.amazonaws.com clio-manage-prod-au-a-temporary.s3.ap-southeast-2.amazonaws.com clio-manage-prod-ca-a-documents.s3.ca-central-1.amazonaws.com clio-manage-prod-ca-a-temporary.s3.ca-central-1.amazonaws.com iris-production.s3.us-east-1.amazonaws.com iris-production-eu.s3.eu-west-1.amazonaws.com s3.ap-southeast-2.amazonaws.com/clio-manage-prod-au-a-temporary/ s3.ca-central-1.amazonaws.com/clio-manage-prod-ca-a-temporary/ s3.eu-west-1.amazonaws.com/temporary.goclio.eu/ s3.amazonaws.com/clio-manage-prod-au-a-application-objects/ s3.amazonaws.com/clio-manage-prod-ca-a-application-objects/ s3.amazonaws.com/documents.goclio.com/ s3.amazonaws.com/documents.goclio.eu/ s3.amazonaws.com/clio-manage-staging-us-a-application-objects/ s3.us-east-1.amazonaws.com/cdn.hellosign.com/ s3.us-east-1.amazonaws.com/temporary.goclio.com/ s3.amazonaws.com/temporary.goclio.com/ stripe-data-exports.s3.amazonaws.com; img-src * data: blob:; media-src blob: https:; object-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'report-sample' blob: *.app.clio.com app.clio.com kit.fontawesome.com api.segment.io app.eu.pendo.io cdn.affinipay.com cdn.eu.pendo.io cdn.jsdelivr.net cdn.plaid.com cdn.segment.com clio.uservoice.com connect.facebook.net data.eu.pendo.io fast.wistia.com *.sentry-cdn.com fonts.gstatic.com googleads.g.doubleclick.net js.navattic.com js.stripe.com munchkin.marketo.net pendo-eu-extensions.storage.googleapis.com pendo-eu-static.storage.googleapis.com pendo-eu-static-5065845963096064.storage.googleapis.com privacy-policy.truste.com player.vimeo.com recaptcha.google.com/recaptcha/ snap.licdn.com static.zdassets.com stats.g.doubleclick.net chat.onmaven.app *.qualtrics.com feedback.clio.com themis-solutions.my.site.com themis-solutions--engteam.sandbox.my.site.com themis-solutions--full.sandbox.my.site.com themis-solutions--lvb.sandbox.my.site.com themis-solutions--service.sandbox.my.site.com themis-solutions--staging.sandbox.my.site.com themis-solutions.my.salesforce-scrt.com themis-solutions--engteam.sandbox.my.salesforce-scrt.com themis-solutions--full.sandbox.my.salesforce-scrt.com themis-solutions--lvb.sandbox.my.salesforce-scrt.com themis-solutions--service.sandbox.my.salesforce-scrt.com themis-solutions--staging.sandbox.my.salesforce-scrt.com widget-mediator.zopim.com www.googleadservices.com www.googletagmanager.com www.google.com/recaptcha/ www.gstatic.com/recaptcha/ d384xlc27tuqx4.cloudfront.net d16fnvcdkazl6d.cloudfront.net d1z9ara1acwrvo.cloudfront.net d2jai5xo6vhevf.cloudfront.net d3br3kdz453vlv.cloudfront.net d3erqgaey65nt8.cloudfront.net stackpath.bootstrapcdn.com appsforoffice.microsoft.com ajax.aspnetcdn.com login.microsoftonline.com waconatm.officeapps.live.com *.vlex.com *.netdocuments.app; style-src 'self' https: 'unsafe-inline' 'report-sample'; worker-src 'self' blob:; report-uri https://browser-intake-datadoghq.com/api/v2/logs?dd-api-key=pubc1819cb090e45b9e9d8190699a1cf908&dd-evp-origin=content-security-policy&ddsource=csp-report&ddtags=service%3Amanage%2Cenv%3Aproduction-eu
< 
{ [8949 bytes data]
100 23741  100 23741    0     0   122k      0 --:--:-- --:--:-- --:--:--  122k
* Connection #0 to host eu.app.clio.com left intact
➜  ~ 
re_6qt6Pu4n_P5wWyCCAefPLijBZscLaakzQ


