# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)






`To-Do:`

- make 'add user' a button that expands that option instead of having the menu there

- establish logic for receipt creation, need to link all fields and totals in the ReceiptTable.jsx to API's that will store everything in the correct database tables

- create PrintView.jsx to allow user to print receipt and save data

- handle offline issues: look into caching or local storage to save receipt data till the device reconnects to the internet to save data: allow printing without internet connection but let the user know the data wasn't saved for financial records due to poor internet/no connection 






**The RGC workflow includes:**

1. Login: User enters a 4-digit passcode.

2. Select/Add User: Dropdown of usernames or option to add a new user from the ‘User’ table in the database.

3. Select Client: Search bar and dropdown to display client names from the database, updating as the user types.

4. Receipt Table: Modular input table based on client type:

        - Auto clients: Uses `AutoReceiptMetals` table to store pre-defined weights/prices.

        - HVAC clients: Uses `HVACReceiptMetals` table to store pre-defined weights/prices.

        - All clients (including ‘other’ since they have no pre-defined tables): Uses `userDefinedMetal` table to store custom metals that don’t exist in the pre-defined tables.

        - The input table includes columns for metal names, prices (modifiable, with option to reset to predefined prices from `SetHVACPrices` or `SetAutoPrices` tables), weights, and calculated totals (sum of all weight inputs for each metals type - all the rows under the name/price columns represent multiple weight inputs for the same metal). Ability to add rows/columns for additional weights/metals.

        - Printing View: Displays the client name and location, as well as all totals and metals for printing and a line for customer sign-off. Interfacing with OS printers is required. Upon “Print” confirmation, data is sent to the database.


**Detailed Logic:**
- User Selection: Fills CreatedBy attribute in the Receipt table.
- Client Selection: Fills ClientID and PaymentMethod in the Receipt table.
- Metal Prices and Names: Predefined from SetAutoPrices or SetHVACPrices based on client type or none for 'other' - ‘other’ clients get an empty table that will be filled by the user making the receipt and everything is stored in the userDefinedMetal table.
- Weights Input: Summed up for AutoReceiptMetals or HVACReceiptMetals tables. Prices can be modified in the receipt creation table.
- User-defined Metals: Stored in the userDefinedMetal table - allows custom metal input (things not included in the pre-defined metals) for any type of client.
- Date/Time: Automatically added to the Receipt upon creation and updates LastPickupDate for the client in the Client table.
- Catalytic Converters (Auto clients): Stores part number/name, price, and % full in the CatalyticConverter table.


**Extra Logic:**
Total Payout: (Pre-defined weights * prices) + (user-defined weights * prices) + (catalytic price * percent full)

Total Volume: (Pre-defined weights) + (user-defined weights)


total payout/volume go on the Receipt table, and sum into the running totals in the Client table.
