# 811 Integration API

A comprehensive Node.js API service that automates the submission and tracking of 811 (Call Before You Dig) requests across all US states and Canadian provinces. The system integrates with Salesforce and uses AI-powered automation to submit requests via web forms, phone calls, emails, and APIs.

## Features

- **Universal 811 Request Submission**: Single API endpoint to submit requests to any 811 district in US/Canada
- **Multi-Method Submission**: Automatically selects the best submission method (API, Web Form, Email, Phone)
- **AI-Powered Automation**:
  - Web form filling using Puppeteer and OpenAI
  - Automated phone calls using Twilio
  - Email parsing and response handling
  - Speech-to-text transcription for call recordings
- **Status Tracking**: Automated polling and webhook support for real-time updates
- **Salesforce Integration**: Direct integration with Salesforce flows and records
- **District Coverage**: Complete coverage of all US states and Canadian provinces

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: AWS DynamoDB
- **Storage**: AWS S3
- **Queue**: AWS SQS
- **AI/ML**: OpenAI GPT-4, Whisper
- **Automation**: Puppeteer, Twilio
- **Email**: IMAP, Nodemailer

## Prerequisites

- Node.js 16+ 
- AWS Account with configured services
- Twilio Account
- OpenAI API Key
- Email account with IMAP access
- Salesforce instance (for integration)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd 811-integration-api
```

2. Install dependencies:
```bash
npm install
```

3. Run setup script:
```bash
node setup.js
```

4. Configure environment variables by editing `.env` file with your credentials

5. Start the development server:
```bash
npm run dev
```

## API Documentation

### Authentication

All API endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Create 811 Request
```
POST /api/requests
```

Request body:
```json
{
  "contactName": "John Doe",
  "companyName": "ABC Construction",
  "phone": "+1-555-123-4567",
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zipCode": "78701",
    "country": "US"
  },
  "workType": "excavation",
  "workDescription": "Installing new water line",
  "startDate": "2024-02-01",
  "duration": 3,
  "depth": 4,
  "workArea": {
    "length": 50,
    "width": 3,
    "nearestCrossStreet": "Oak Ave",
    "markedArea": true
  },
  "emergencyWork": false
}
```

#### Get Request Status
```
GET /api/requests/{requestId}
```

#### Get Status Updates
```
GET /api/status/{requestId}
```

#### Search Requests
```
GET /api/requests?districtId={districtId}&status={status}
```

### Salesforce Integration

The API provides special endpoints for Salesforce Flow integration:

```
POST /api/salesforce/flow/create
```

This endpoint accepts Salesforce field names and automatically maps them to the internal format.

## District Information

# 811 One-Call Districts (US) and Utility Locate Services (Canada)

The table below lists each U.S. state (and territory) 811 call-before-you-dig center and each Canadian provincial/territorial one-call service. For each, it gives the district name, the area covered, the methods available to submit a locate request, and links to official websites or portals. Where methods differ for homeowners vs. contractors (when noted on the official site), that is indicated. All information is from the organizations’ official sources.

| District / Service Name (Call Center)                               | Area Covered                                                   | Submission Methods                                                                            | Official Site / Request Portal                                                    |
| ------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Alabama 811 (AL811)**                                             | Alabama                                                        | - Phone: 811 (or 800‑292‑8525 outside AL)<br>- Web ticket request (online portal)             | [al811.com](https://al811.com)                                                    |
| **Alaska Digline, Inc.**                                            | Alaska                                                         | - Phone: 811 (or 800‑478‑3121)                                                                | [akonecall.com](https://akonecall.com)                                            |
| **Arizona Blue Stake, Inc.**                                        | Arizona                                                        | - Phone: 811 (or 800‑782‑5348)<br>- Online ticket (web portal)                                | [azbluestake.com](https://azbluestake.com)                                        |
| **Arkansas One Call**                                               | Arkansas                                                       | - Phone: 811 (or 800‑482‑8998)                                                                | [arkonecall.com](https://arkonecall.com)                                          |
| **USA North 811 (Underground Service Alert North)**                 | Northern/Central California & Nevada                           | - Phone: 811 (or 800‑227‑2600) – *pre-marking required*<br>- Online request form (web portal) | [usanorth.org](https://www.usanorth.org)                                          |
| **USA South 811 (DigAlert)**                                        | Southern California                                            | - Phone: 811 (or 800‑227‑2600)<br>- Online request form (web portal)                          | [digalert.org](https://www.digalert.org)                                          |
| **Colorado 811 (UNCC)**                                             | Colorado                                                       | - Phone: 811 (or 800‑922‑1987)<br>- Web portal (“Ticketing” website)                          | [uncc.org](https://www.uncc.org)                                                  |
| **Connecticut – “Call Before You Dig” (CBYD)**                      | Connecticut                                                    | - Phone: 811 (or 800‑922‑4455)<br>- Web portal (submit online ticket)                         | [cbyd.com](https://www.cbyd.com)                                                  |
| **Miss Utility of Delmarva**                                        | Delaware, Eastern Maryland                                     | - Phone: 811 (or 800‑282‑8555)<br>- Web portal (missutility.net)                              | [missutility.net](https://www.missutility.net)                                    |
| **Miss Utility (Maryland)**                                         | Western Maryland (West of Chesapeake Bay)                      | - Phone: 811 (or 800‑257‑7777)<br>- Web portal (missutility.net)                              | [missutility.net](https://www.missutility.net)                                    |
| **D.C. – Miss Utility**                                             | Washington, D.C.                                               | - Phone: 811 (or 800‑257‑7777)                                                                | [missutility.net](https://www.missutility.net)                                    |
| **Sunshine State One Call**                                         | Florida                                                        | - Phone: 811 (or 800‑432‑4770)<br>- Web portal (callsunshine.com)                             | [callsunshine.com](https://www.callsunshine.com)                                  |
| **Georgia 811 (GA 811)**                                            | Georgia                                                        | - Phone: 811 (or 800‑282‑7411)<br>- Web portal (gaupc.com)                                    | [gaupc.com](https://www.gaupc.com)                                                |
| **Hawaii One Call**                                                 | Hawaii                                                         | - Phone: 811 (or 800‑227‑2600)                                                                | [callbeforeyoudig.org](https://callbeforeyoudig.org)                              |
| **Dig Line (Idaho)**                                                | Idaho (rest of state)                                          | - Phone: 811 (or 800‑342‑1585)<br>- Web portal (digline.com)                                  | [digline.com](https://www.digline.com)                                            |
| **Password, Inc. (Northern Idaho)**                                 | Northern Idaho counties (Kootenai, Bonner, Boundary, Shoshone) | - Phone: 208-667-7491 (or toll-free per branch)<br>- Web portal (passwordinc.com)             | [passwordinc.com](https://passwordinc.com)                                        |
| **J.U.L.I.E., Inc. (Illinois 1-Call)**                              | Illinois (outside Chicago)                                     | - Phone: 811 (or 800‑892‑0123)<br>- Web portal (illinois1call.com)                            | [illinois1call.com](https://www.illinois1call.com)                                |
| **Digger – Chicago Utility Alert Network**                          | Chicago & collar counties, IL                                  | - Phone: (312) 744‑7000<br>- No web portal (city-run system)                                  | [Chicago One Call](https://www.chicago.gov/city/en/depts/awm/provdrs/digger.html) |
| **Indiana 811**                                                     | Indiana                                                        | - Phone: 811 (or 800‑382‑5544)<br>- Web portal (indiana811.org)                               | [indiana811.org](https://www.indiana811.org)                                      |
| **Iowa One Call**                                                   | Iowa                                                           | - Phone: 811 (or 800‑292‑8989)<br>- Web portal (iowaonecall.com)                              | [iowaonecall.com](https://www.iowaonecall.com)                                    |
| **Kansas One Call**                                                 | Kansas                                                         | - Phone: 811 (or 800‑344‑7233) (800-DIG-SAFE)<br>- Web portal (kansasonecall.com)             | [kansasonecall.com](https://www.kansasonecall.com)                                |
| **Kentucky 811**                                                    | Kentucky                                                       | - Phone: 811 (or 800‑752‑6007)<br>- Web portal (kentucky811.org)                              | [kentucky811.org](https://www.kentucky811.org)                                    |
| **LA One Call**                                                     | Louisiana                                                      | - Phone: 811 (or 800‑272‑3020)<br>- Web portal (laonecall.com)                                | [laonecall.com](https://www.laonecall.com)                                        |
| **Dig Safe (New England)**                                          | Maine, Massachusetts, Rhode Island, New Hampshire, Vermont     | - Phone: 811 (or 888‑344‑7233)<br>- Web portal (digsafe.com)                                  | [digsafe.com](https://www.digsafe.com)                                            |
| **Miss Dig System, Inc.**                                           | Michigan                                                       | - Phone: 811 (or 800‑482‑7171)<br>- Web portal (missdig.org)                                  | [missdig.org](https://www.missdig.org)                                            |
| **Gopher State One Call**                                           | Minnesota                                                      | - Phone: 811 (or 800‑252‑1166)<br>- Web portal (gopherstateonecall.org)                       | [gopherstateonecall.org](https://www.gopherstateonecall.org)                      |
| **Mississippi 811 (MS811)**                                         | Mississippi                                                    | - Phone: 811 (or 800‑227‑6477)<br>- Web portal (ms1call.org)                                  | [ms1call.org](https://www.ms1call.org)                                            |
| **Missouri One Call System**                                        | Missouri                                                       | - Phone: 811 (or 800‑344‑7483)<br>- Web portal (mo1call.org)                                  | [mo1call.org](https://www.mo1call.org)                                            |
| **Montana One Call Center**                                         | Montana (most counties)                                        | - Phone: 811 (or 800‑424‑5555)<br>- Web portal (callbeforeyoudig.org)                         | [callbeforeyoudig.org](https://www.callbeforeyoudig.org)                          |
| **One-Call of Montana (UDig)**                                      | Montana (Flathead & Lincoln counties)                          | - Phone: 811 (or 800‑551‑8344)<br>- Web portal (udig.org)                                     | [udig.org](https://www.udig.org)                                                  |
| **Nebraska 811 (NE One Call)**                                      | Nebraska                                                       | - Phone: 811 (or 800‑331‑5666)<br>- Web portal (ne1call.com)                                  | [ne1call.com](https://ne1call.com)                                                |
| **USA North 811 (Continued: Nevada)**                               | Nevada                                                         | - Same center as Northern CA (800‑227‑2600)                                                   | [usanorth.org](https://www.usanorth.org)                                          |
| **New Jersey One Call**                                             | New Jersey                                                     | - Phone: 811 (or 800‑272‑1000)<br>- Web portal (nj1-call.org)                                 | [nj1-call.org](https://www.nj1-call.org)                                          |
| **New Mexico One Call**                                             | New Mexico                                                     | - Phone: 811 (or 800‑321‑2537)<br>- Web portal (nmonecall.org)                                | [nmonecall.org](https://www.nmonecall.org)                                        |
| **Dig Safely New York**                                             | New York (upstate)                                             | - Phone: 811 (or 800‑962‑7962)<br>- Web portal (digsafelynewyork.com)                         | [digsafelynewyork.com](https://www.digsafelynewyork.com)                          |
| **DigNet**                                                          | New York (5 boroughs & Long Island)                            | - Phone: 811 (or 800‑272‑4480)<br>- Web portal (newyork-811.com)                              | [newyork-811.com](https://www.newyork-811.com)                                    |
| **North Carolina 811**                                              | North Carolina                                                 | - Phone: 811 (or 800‑632‑4949)<br>- Web portal (nc811.org)                                    | [nc811.org](https://www.nc811.org)                                                |
| **North Dakota One Call**                                           | North Dakota                                                   | - Phone: 811 (or 800‑795‑0555)<br>- Web portal (ndonecall.com)                                | [ndonecall.com](https://www.ndonecall.com)                                        |
| **Ohio Utilities Protection Service (OHIO811)**                     | Ohio                                                           | - Phone: 811 (or 800‑362‑2764)<br>- Web portal (i‑dig remote ticket entry for contractors)    | [oups.org](https://oups.org)                                                      |
| **Call Okie**                                                       | Oklahoma                                                       | - Phone: 811 (or 800‑522‑6543)<br>- Web portal (callokie.com)                                 | [callokie.com](https://www.callokie.com)                                          |
| **Oregon Utility Notification Center (Call Before You Dig Oregon)** | Oregon                                                         | - Phone: 811 (or 800‑332‑2344)<br>- Web portal (digsafelyoregon.com)                          | [digsafelyoregon.com](https://www.digsafelyoregon.com)                            |
| **Pennsylvania One Call System, Inc.**                              | Pennsylvania                                                   | - Phone: 811 (or 800‑242‑1776)<br>- Web portal (paonecall.org)                                | [paonecall.org](https://www.paonecall.org)                                        |
| **Dig Safe System, Inc. (RI)**                                      | Rhode Island                                                   | - Phone: 811 (or 888‑344‑7233)                                                                | [digsafe.com](https://www.digsafe.com)                                            |
| **South Carolina 811 (SC1PUPS)**                                    | South Carolina                                                 | - Phone: 811 (or 800‑922‑0983)<br>- Web portal (sc1pups.org)                                  | [sc1pups.org](https://www.sc1pups.org)                                            |
| **South Dakota One Call**                                           | South Dakota                                                   | - Phone: 811 (or 800‑781‑7474)<br>- Web portal (sdonecall.com)                                | [sdonecall.com](https://www.sdonecall.com)                                        |
| **Tennessee 811**                                                   | Tennessee                                                      | - Phone: 811 (or 800‑351‑1111)<br>- Web portal (tennessee811.com)                             | [tennessee811.com](https://www.tennessee811.com)                                  |
| **Lone Star 811**                                                   | Texas (eastern/southern)                                       | - Phone: 811 (or 800‑669‑8344)<br>- Web portal (lonestar811.com)                              | [lonestar811.com](https://www.lonestar811.com)                                    |
| **Texas811 (Northwest TX)**                                         | Texas (northwest)                                              | - Phone: 811 (or 800‑344‑8377)<br>- Web portal (texas811.org)                                 | [texas811.org](https://www.texas811.org)                                          |
| **Blue Stakes (One‑Call of Utah)**                                  | Utah                                                           | - Phone: 811 (or 800‑662‑4111)<br>- Web portal (bluestakes.org)                               | [bluestakes.org](https://www.bluestakes.org)                                      |
| **Dig Safe – Vermont**                                              | Vermont                                                        | - Phone: 811 (or 888‑344‑7233)                                                                | [digsafe.com](https://www.digsafe.com)                                            |
| **Miss Utility of Virginia**                                        | Virginia                                                       | - Phone: 811 (or 800‑552‑7001)<br>- Web portal (missutilityofvirginia.com)                    | [missutilityofvirginia.com](https://www.missutilityofvirginia.com)                |
| **Utility Notification Center**                                     | Washington                                                     | - Phone: 811 (or 800‑332‑2344)<br>- Web portal (callbeforeyoudig.org)                         | [callbeforeyoudig.org](https://www.callbeforeyoudig.org)                          |
| **Miss Utility of West Virginia**                                   | West Virginia                                                  | - Phone: 811 (or 800‑245‑4848)<br>- Web portal (muwv.org)                                     | [muwv.org](https://www.muwv.org)                                                  |
| **Diggers Hotline**                                                 | Wisconsin                                                      | - Phone: 811 (or 800‑242‑8511)<br>- Web portal (diggershotline.com)                           | [diggershotline.com](https://www.diggershotline.com)                              |
| **One-Call of Wyoming**                                             | Wyoming                                                        | - Phone: 811 (or 800‑849‑2476)<br>- Web portal (onecallofwyoming.com)                         | [onecallofwyoming.com](https://www.onecallofwyoming.com)                          |

**U.S. Territories:**  Puerto Rico has an 811 service run by the Puerto Rico Department of Transportation and Public Works (DTOP).  Contractors and residents submit excavation/demolition notices online via the Puerto Rico 811 portal (requires account) or call 811.  (Puerto Rico 811 portal: *puertorico811.dtop.pr.gov*).  **Example:** *“PUERTO RICO 811”* (DTOP Excavation/Demolition Center) – Methods: Online notices (portal), email ([excavaciones@dtop.pr.gov](mailto:excavaciones@dtop.pr.gov)) and phone 811.

## Canadian Provincial/Territorial One-Call Services

| Service Name                                             | Province / Territory                                                              | Submission Methods                                                                                                                     | Official Site / Request Portal                                    |
| -------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Alberta One-Call (Utility Safety Partners)**           | Alberta                                                                           | - Web portal (Where’s the Line portal – submit locate request online)<br>- Phone: 1‑800‑242‑3447                                       | [utilitysafety.ca](https://utilitysafety.ca) (Where’s the Line)   |
| **BC One Call (BC 1‑Call)**                              | British Columbia                                                                  | - Web portal (online locate ticket)<br>- Phone: 1‑800‑474‑6886                                                                         | [bc1c.ca](https://www.bc1c.ca)                                    |
| **Saskatchewan 1st Call**                                | Saskatchewan                                                                      | - Web portal (sask1stcall.com) – online ticket entry<br>- Phone: 1‑866‑828‑4888                                                        | [sask1stcall.com](https://www.sask1stcall.com)                    |
| **Manitoba – ClickBeforeYouDig MB**                      | Manitoba                                                                          | - Web portal (clickbeforeyoudigmb.com) – ticket entry<br>- Phone: 1‑800‑940‑3447                                                       | [clickbeforeyoudigmb.com](https://clickbeforeyoudigmb.com)        |
| **MB1Call** (private locator cooperative)                | MB, East SK, West ON, Nunavut                                                     | - Web portal (mb1call.com) – limited coverage in MB, SK, ON, NU<br>- Phone: 204‑777‑6590                                               | [mb1call.com](https://mb1call.com)                                |
| **Ontario One Call**                                     | Ontario                                                                           | - Web portal (portal.ontarioonecall.ca) (submit request 5+ business days ahead)<br>- Phone: 1‑800‑400‑2255                             | [ontarioonecall.ca](https://ontarioonecall.ca)                    |
| **Info-Excavation (Info-Ex)**                            | Québec, New Brunswick, Nova Scotia, Prince Edward Island, Newfoundland & Labrador | - Web portal (webportal.info-ex.com)<br>- Phone: 1‑800‑663‑9228                                                                        | [info-ex.com](https://www.info-ex.com)                            |
| **New Brunswick – ClickBeforeYouDig NB** *(via Info-Ex)* | New Brunswick (Atlantic)                                                          | (Same as Info-Excavation above)                                                                                                        | [info-ex.com](https://www.info-ex.com)                            |
| **Nova Scotia – ClickBeforeYouDig NS** *(via Info-Ex)*   | Nova Scotia (Atlantic)                                                            | (Same as Info-Excavation above)                                                                                                        | [info-ex.com](https://www.info-ex.com)                            |
| **PEI – ClickBeforeYouDig PEI** *(via Info-Ex)*          | Prince Edward Island (Atlantic)                                                   | (Same as Info-Excavation above)                                                                                                        | [info-ex.com](https://www.info-ex.com)                            |
| **Info-Excavation (NWT)**                                | Northwest Territories                                                             | - Phone (Enbridge Pipelines): 867‑587‑7000 (pipeline projects)<br>- *No formal one-call center; use pipeline contact*                  | *N/A (see link below)*                                            |
| **Yukon One Call** *(via utility companies)*             | Yukon                                                                             | - Contact Yukon Energy ([locates@yec.yk.ca](mailto:locates@yec.yk.ca), 867‑393‑5300 ext.3) or Northwestel (1‑888‑768‑5377) for locates | *No single provincial portal; see Yukon Energy or NWTel contacts* |

Each entry above is drawn from the organization’s official information.  For example, Ontario One Call specifies that homeowners/contractors **must submit a locate request at least 5 business days before digging** via its web portal.  Info-Excavation (serving QC and the Atlantic provinces) provides a free web portal for locating services (Quebec’s 811-equivalent) and phone numbers.  Utility Safety Partners (formerly Alberta One-Call) runs the “Where’s the Line” portal, which requires a minimum 3–5 business days notice.  BC 1 Call permits 24/7 online requests or calling 1‑800‑474‑6886.  Ohio811 provides an online “i‑dig” remote ticket entry system for contractors, as well as phone support.  Puerto Rico’s 811 (DTOP Excavation/Demolition Center) requires users to register on its portal (or call 811).

**Sources:** Official state/one-call websites and portals for each entry. These include “how-to request” pages and FAQ sections where submission methods are described. Geographical coverage is as noted on each organization’s site.  (Some entries share services across regions – e.g. Info-Excavation serves multiple provinces.)


The app should be able to submit a request to 811. it will need to take in an address and other required details to submit a  request through a api. there should be 1 api to submit any 811 request to any district.
we should use llama 2 to make phone calls , submit webforms and emails. we need to be able respond to emails and exteact additional details. we need to be able extract details from the phone calls.

after creating a request, users should be able to get updates. the application should be able to get that update using the required method. 

we should try and use llama and automate submission patterns when wr are able to to reduce cost. for example submitting a webform could be automated.

This app will be built using node and aws services. A salesforce app that integrates with the api through a flow action aka invocable.

## How It Works

### Submission Process

1. **Request Creation**: When a request is submitted via the API, the system automatically identifies the appropriate 811 district based on the work location.

2. **Method Selection**: The system selects the best submission method in this priority order:
   - API (if available)
   - Web Form
   - Email
   - Phone Call

3. **Automated Submission**:
   - **API**: Direct API integration for districts that support it
   - **Web Form**: AI-powered form filling using Puppeteer and OpenAI
   - **Email**: Automated email generation and sending
   - **Phone**: AI-generated call scripts executed via Twilio

4. **Status Tracking**:
   - Webhook listeners for real-time updates
   - Email monitoring for responses
   - Periodic web scraping for status checks
   - Call recording transcription

### AI Integration

The system uses OpenAI GPT-4 for:
- Analyzing web forms and generating filling instructions
- Creating natural phone call scripts
- Parsing email responses
- Extracting ticket numbers from various formats

### Error Handling

If a submission method fails, the system automatically falls back to the next available method. All attempts are logged and status updates are provided via the API.

## Development

### Running Tests
```bash
npm test
```

### Test API
```bash
node src/test/testApi.js
```

### Logs
- Application logs: `logs/all.log`
- Error logs: `logs/error.log`
- Screenshots (for debugging): `screenshots/`

## License

This project is proprietary software. All rights reserved.
