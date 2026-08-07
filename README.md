# gatto-mario

Un piccolo platform browser game in cui Mario il gatto affronta galline, tazze
di caffè e palline pelose.

## Avvio

Apri `index.html` nel browser.

Su desktop muoviti con **← →** oppure **A D**, salta con **Spazio** e usa
**X** per sparare dopo aver raccolto un taco o un profiterole. Su mobile usa
i pulsanti sotto il gioco.

- Il pane aggiunge una vita e rende Mario più grasso.
- Il taco dà un sombrero e permette di sparare fagioli.
- Il profiterole permette di sparare dall'altro lato.

## Test

```sh
npm test
```

## Deploy

Il gioco viene pubblicato su Azure Static Web Apps tramite GitHub Actions
(`.github/workflows/azure-static-web-apps-ashy-coast-0f16e1c03.yml`).

Il deploy usa il secret `AZURE_STATIC_WEB_APPS_API_TOKEN_ASHY_COAST_0F16E1C03`.
Questo token di deployment cambia quando l'app viene spostata tra resource group
o subscription: in quel caso aggiorna il valore del secret con il nuovo
deployment token (dal portale Azure, sezione **Manage deployment token** della
Static Web App). Se il secret manca, il workflow salta il deploy invece di
fallire.

