import * as cheerio from "cheerio";

/**
 * Register to the lecture
 * @param action - action to perform e.g (actionx:dla_stud/rejestracja/brdg2/zarejestruj(rej_kod:WPA-P-23@12f24L-S2;prz_kod:WPA-10.P-3181;cdyd_kod:23@12f24L;odczyt:0;prgos_id:591156;callback:g_b9044676)) - search devtools for it
 */
async function registerUsos(action: string, sessionCookie: string) {
  const form = new FormData();

  form.append("_action", action);
  form.append("csrftoken", "2024-02-16-32faa9399a34124e");
  form.append("ajax", "1");

  // UJ example, change if needed
  const response = await fetch("https://www.usosweb.uj.edu.pl/kontroler.php", {
    method: "POST",
    headers: {
      Cookie: `PHPSESSID=${sessionCookie}`,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0",
    },
    body: form,
  });

  return response.text();
}

/**
 * Attendees scrapper
 * @param url - lecture url
 */
async function fetchUsos(url: string, sessionCookie: string) {
  const response = await fetch(url, {
    headers: {
      Cookie: `PHPSESSID=${sessionCookie}`,
    },
  });

  return response.text();
}

/**
 * Parse attendees
 * @param html - html to parse
 */
function parseUsos(html: string) {
  const $ = cheerio.load(html);
  return $(".strong > td:nth-child(2)").text().trim(); // change if needed
}

async function main() {
  const interval = setInterval(async () => {
    try {
      const htmlText = await fetchUsos(
        "https://www.usosweb.uj.edu.pl/kontroler.php?_action=dla_stud/rejestracja/brdg2/grupyPrzedmiotu&rej_kod=WPA-P-23%2F24L-S2&prz_kod=WPA-10.P-31811&cdyd_kod=23%2F24L&odczyt=1&callback=g_f11c9207",
        "sessionCookie"
      );
      const attendees = parseUsos(htmlText);
      console.log(`[${new Date().toUTCString()}] ` + attendees);

      // change if needed
      if (attendees !== "30") {
        const response = await registerUsos(
          "actionx:dla_stud/rejestracja/brdg2/zarejestruj(rej_kod:WPA-P-23@12f24L-S2;prz_kod:WPA-10.P-3181;cdyd_kod:23@12f24L;odczyt:0;prgos_id:591156;callback:g_b9044676)",
          "sessionCookie"
        );
        const json = JSON.parse(response);
        console.log(json.pl);
        process.exit(0);
      }
    } catch (err) {
      console.error((err as Error).message);
    }
  }, 1000);
}

main();
