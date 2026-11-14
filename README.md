# My Budget Tracker

A phone-friendly personal budget tracker made with plain HTML, CSS and JavaScript. No build step, account, analytics or bank connection.

## Run and install

For a preview, open index.html in a browser. To install on a phone and use offline, publish these files to a static web host over HTTPS. open source .Open the HTTPS site on the phone and choose Add to Home Screen in iPhone Safari or Install app in Android Chrome.

## Included budget

- Monthly plan total: ₹3,000
- Spending: Food/snacks ₹900; Mobile ₹300; Transport ₹300; Personal ₹300; Social/quick plans ₹400
- Reserves: Academic/irregular ₹500; Emergency ₹300
- Account labels: SBI for spending and Canara for reserves
- Essential hostel accommodation and regular meals assumed covered separately

Category balances start at zero. The reported SBI ₹1,100 and Canara ₹1,500 are not automatically counted as category funds, to avoid counting the same bank money twice. You can set an opening balance for each category in Plan & data.

## How calculations work

Available balance = opening balance + monthly allocations from the tracking start month through the selected month - entries recorded through that month. Regular categories carry unused balances forward; reserve balances accumulate for their stated purpose. The month view shows that month’s budget and spending, while available includes carry-forward. Changing category amounts affects all months and recalculates history.

## Privacy and backup

Information stays in local browser storage on one device; it does not sync automatically. Use Plan & data → Download backup and Restore backup to move data. Keep backups private. Clearing browser data or switching device/browser may remove access to the local records.

## Customize and share

Plan & data lets you edit currency, monthly total, tracking start, assumptions, categories, amounts, opening balances, fund types and account labels. Edit index.html, styles.css and app.js for larger changes. The MIT License permits you to fork, modify and share your version.
