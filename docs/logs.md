 ✓ Compiled /api/approve in 164ms (547 modules)
[Approve][Step 0] Starting approve pipeline for Matter #14537825 {
  "client": "FAUSTO CASTILLO",
  "email": "huwas003@gmail.com",
  "accidentDate": "11/16/2022",
  "statuteDate": "2030-11-16"
}
[Approve][Step 1] Updating 8 custom fields on Matter #14537825
[Clio][updateCustomFields] Matter #14537825: updating 8 fields
[Clio][fetch] GET /api/v4/matters/14537825?fields=id,custom_field_values{id,custom_field}
[Clio][fetch] OK 200 in 271ms
[Clio][updateCustomFields] Found 8 existing custom field values
[Clio][updateCustomFields] Merging: 8 updates, 0 new
[Clio][fetch] PATCH /api/v4/matters/14537825
[Clio][fetch] OK 200 in 229ms
[Clio][updateCustomFields] Custom fields saved successfully
[Approve][Step 1] Custom fields updated successfully
[Approve][Step 2] Generating retainer: "Retainer_Agreement_CASTILLO" using template #359618
[Clio][generateRetainer] Template #359618, Matter #14537825, filename: "Retainer_Agreement_CASTILLO"
[Clio][fetch] POST /api/v4/document_automations
[Clio][fetch] OK 201 in 123ms
[Approve][Step 2] Retainer generation triggered
[Approve][Step 3] Creating SOL calendar entry: 2030-11-16 on calendar #437603
[Clio][createCalendarEntry] Calendar #437603, Matter #14537825, date: 2030-11-16, client: FAUSTO CASTILLO
[Clio][fetch] POST /api/v4/calendar_entries
[Clio][fetch] OK 201 in 396ms
[Approve][Step 3] Calendar entry created
[Approve][Step 4] Attempt 1/3: waiting 4s for Clio document generation...
[Clio][getMatterDocuments] Listing documents for Matter #14537825
[Clio][fetch] GET /api/v4/documents?fields=id,name,latest_document_version&matter_id=14537825
[Clio][fetch] OK 200 in 287ms
[Clio][getMatterDocuments] Found 2 documents
[Approve][Step 4] Found 2 documents on Matter #14537825 [
  {
    "id": 777403100,
    "name": "Retainer_Agreement_CASTILLO.pdf"
  },
  {
    "id": 777441611,
    "name": "Retainer_Agreement_CASTILLO.pdf"
  }
]
[Approve][Step 4] Downloading retainer doc #777403100: "Retainer_Agreement_CASTILLO.pdf"
[Clio][downloadDocument] Getting version info for doc #777403100
[Clio][fetch] GET /api/v4/documents/777403100?fields=id,name,latest_document_version
[Clio][fetch] OK 200 in 85ms
[Clio][downloadDocument] Downloading version #761805707
[Clio][fetch] GET /api/v4/document_versions/761805707/download
[Clio][fetch] FAILED 404 in 66ms: <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
       "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
  <title>Sorry, we couldn't find the page you're looking for.</title>
  <style type="text/css">

    html {
      text-align: center;
    }

    body {
      background: #0075BB;
      color: #fff;
      font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
      padding-botto
[Clio][downloadDocument] FAILED: Clio API 404: <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
       "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
  <title>Sorry, we couldn't find the page you're looking for.</title>
  <style type="text/css">

    html {
      text-align: center;
    }

    body {
      background: #0075BB;
      color: #fff;
      font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
      padding-bottom: 48px;
    }

    h1 {
      font-weight: 400;
      font-size: 48px;
      margin: 0;
    }

    p {
      margin: 24px 0 0;
      font-size: 24px;
      line-height: 1.4;
    }

    a {
      color: #fff;
    }

    .gem {
      position: fixed;
      top: 20px;
      left: 20px;
    }

    .illustration {
      margin-top: 106px;
    }
  </style>
</head>

<body>
<a="https://www.clio.com/" class="gem">
  <img width="48" height="48" title="" alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5CC">
</a>

<img class="illustration" width="360" height="278" title="" alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAaEAAAFCCAYAAABYeGLuAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5K5CYII=">

<h1>Sorry, we couldn't find the page you're looking for.</h1>
<p>
  Please double check that the address is correct, or return to Clio.
</p>

</body>
</html>

[Approve][Step 4] Download returned null on attempt 1
[Approve][Step 4] Will retry...
[Approve][Step 4] Attempt 2/3: waiting 5s for Clio document generation...
[Clio][getMatterDocuments] Listing documents for Matter #14537825
[Clio][fetch] GET /api/v4/documents?fields=id,name,latest_document_version&matter_id=14537825
[Clio][fetch] OK 200 in 214ms
[Clio][getMatterDocuments] Found 2 documents
[Approve][Step 4] Found 2 documents on Matter #14537825 [
  {
    "id": 777403100,
    "name": "Retainer_Agreement_CASTILLO.pdf"
  },
  {
    "id": 777441611,
    "name": "Retainer_Agreement_CASTILLO.pdf"
  }
]
[Approve][Step 4] Downloading retainer doc #777403100: "Retainer_Agreement_CASTILLO.pdf"
[Clio][downloadDocument] Getting version info for doc #777403100
[Clio][fetch] GET /api/v4/documents/777403100?fields=id,name,latest_document_version
[Clio][fetch] OK 200 in 81ms
[Clio][downloadDocument] Downloading version #761805707
[Clio][fetch] GET /api/v4/document_versions/761805707/download
[Clio][fetch] FAILED 404 in 48ms: <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
       "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
  <title>Sorry, we couldn't find the page you're looking for.</title>
  <style type="text/css">

    html {
      text-align: center;
    }

    body {
      background: #0075BB;
      color: #fff;
      font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
      padding-botto
[Clio][downloadDocument] FAILED: Clio API 404: <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
       "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
  <title>Sorry, we couldn't find the page you're looking for.</title>
  <style type="text/css">

    html {
      text-align: center;
    }

    body {
      background: #0075BB;
      color: #fff;
      font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
      padding-bottom: 48px;
    }

    h1 {
      font-weight: 400;
      font-size: 48px;
      margin: 0;
    }

    p {
      margin: 24px 0 0;
      font-size: 24px;
      line-height: 1.4;
    }

    a {
      color: #fff;
    }

    .gem {
      position: fixed;
      top: 20px;
      left: 20px;
    }

    .illustration {
      margin-top: 106px;
    }
  </style>
</head>

<body>
<a href="https://www.clio.com/" class="gem">
  <img width="48" height="48" title="" alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5uQmCC">
</a>

<img class="illustration" width="360" height="278" title="" alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAaEAAAFCCAYAAABYeGLuAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5c/AQYAlL3Ky2PRMXkAAAAASUVORK5CYII=">

<h1>Sorry, we couldn't find the page you're looking for.</h1>
<p>
  Please double check that the address is correct, or return to Clio.
</p>

</body>
</html>

[Approve][Step 4] Download returned null on attempt 2
[Approve][Step 4] Will retry...
[Approve][Step 4] Attempt 3/3: waiting 5s for Clio document generation...
[Clio][getMatterDocuments] Listing documents for Matter #14537825
[Clio][fetch] GET /api/v4/documents?fields=id,name,latest_document_version&matter_id=14537825
[Clio][fetch] OK 200 in 168ms
[Clio][getMatterDocuments] Found 2 documents
[Approve][Step 4] Found 2 documents on Matter #14537825 [
  {
    "id": 777403100,
    "name": "Retainer_Agreement_CASTILLO.pdf"
  },
  {
    "id": 777441611,
    "name": "Retainer_Agreement_CASTILLO.pdf"
  }
]
[Approve][Step 4] Downloading retainer doc #777403100: "Retainer_Agreement_CASTILLO.pdf"
[Clio][downloadDocument] Getting version info for doc #777403100
[Clio][fetch] GET /api/v4/documents/777403100?fields=id,name,latest_document_version
[Clio][fetch] OK 200 in 86ms
[Clio][downloadDocument] Downloading version #761805707
[Clio][fetch] GET /api/v4/document_versions/761805707/download
[Clio][fetch] FAILED 404 in 83ms: <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
       "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
  <title>Sorry, we couldn't find the page you're looking for.</title>
  <style type="text/css">

    html {
      text-align: center;
    }

    body {
      background: #0075BB;
      color: #fff;
      font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
      padding-botto
[Clio][downloadDocument] FAILED: Clio API 404: <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
       "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
  <title>Sorry, we couldn't find the page you're looking for.</title>
  <style type="text/css">

    html {
      text-align: center;
    }

    body {
      background: #0075BB;
      color: #fff;
      font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
      padding-bottom: 48px;
    }

    h1 {
      font-weight: 400;
      font-size: 48px;
      margin: 0;
    }

    p {
      margin: 24px 0 0;
      font-size: 24px;
      line-height: 1.4;
    }

    a {
      color: #fff;
    }

    .gem {
      position: fixed;
      top: 20px;
      left: 20px;
    }

    .illustration {
      margin-top: 106px;
    }
  </style>
</head>

<body>
<a href="https://www.clio.com/" class="gem">
  <img width="48" height="48" title="" alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5uQmCC">
</a>

<img class="illustration" width="360" height="278" title="" alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAaEAAAFCCAYAAABYeGLuAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAN4dJREFUeNrsnQdgFFX+x38zsy2NJBASeu9FmogecKAeRdQTRUTxVDzLX0/Es5yCeuphw4qCyp2icnKiIiooAqFXQUqAQBJaCiGFhJBetu//vCEAAAAAEgIAAAAJAQAAAJAQAAAASAgAAACAhAAAAEBCAAAAACQEAADAH/l/AQYAlL3Ky2PRMXkAAAAASUVORK5CYII=">

<h1>Sorry, we couldn't find the page you're looking for.</h1>
<p>
  Please double check that the address is correct, or return to Clio.
</p>

</body>
</html>

[Approve][Step 4] Download returned null on attempt 3
[Approve][Step 5] Sending email to huwas003@gmail.com, Calendly: virtual (Sep-Feb), PDF attached: false
[Email] Preparing email to huwas003@gmail.com
[Email] Drafting AI paragraph for FAUSTO, accident: 11/16/2022
[Email] AI paragraph drafted in 2720ms (474 chars)
[Email] Calendly link: virtual → https://calendly.com/d/cmgz-pmz-w2s/consultation-with-andrew-richards-esq
[Email] PDF attachment: "Retainer_Agreement_CASTILLO.pdf" (0 bytes)
[Email] Sending via Resend: from="Andrew Richards", to="huwas003@gmail.com", subject="Retainer Agreement for Your Review – Richards & Law"
[Email] Resend responded in 243ms {"data":null,"error":{"statusCode":401,"name":"validation_error","message":"API key is invalid"}}
[Approve][Step 5] Email sent {
  "data": null,
  "error": {
    "statusCode": 401,
    "name": "validation_error",
    "message": "API key is invalid"
  }
}
[Approve][Step 0] Pipeline complete in 19292ms
 POST /api/approve 200 in 19523ms
^[[1;2B^[[1;2B^[[1;2B