;(function (window) {
  window.__env = window.__env || {}
  ;(window.__env.production = false),
    (window.__env.googleMapsApiKey = ''),
    (window.__env.backend = 'https://rs-worx.com/api'), // Put your backend here
    (window.__env.backendForFiles = 'https://rs-worx.com'), // Put your backend for file upload
    (window.__env.fakeUrl = 'https://localhost:3000'), // Put your db json url here
    (window.__env.jsonServerUrl = 'https://rs-worx.com/api'),
    (window.__env.dateFormat = 'mediumDate'),
    (window.__env.currencyFormat = 'AED'),
    (window.__env.roundOffFormat = '1.2-2'),
    (window.__env.consumptionRoundOffFormat = '1.2-2'),
    (window.__env.MaxBytes = 3145728),
    (window.__env.externalRoles = {
      ownerExternal: 101,
      tenantExternal: 102,
    }),
    (window.__env.idle = 45),
    (window.__env.timeout = 3000),
    (window.__env.confirmationTimeout = 60000), // 1 minute
    (window.__env.cookieDomain = 'https://rs-worx.com/api')
})(this)
