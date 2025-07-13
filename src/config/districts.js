// 811 District Configuration
const districts = {
  // United States
  'AL811': {
    id: 'AL811',
    name: 'Alabama 811',
    state: 'AL',
    country: 'US',
    area: 'Alabama',
    phone: '811',
    altPhone: '800-292-8525',
    methods: ['phone', 'web'],
    webPortal: 'https://al811.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'AK-DIGLINE': {
    id: 'AK-DIGLINE',
    name: 'Alaska Digline, Inc.',
    state: 'AK',
    country: 'US',
    area: 'Alaska',
    phone: '811',
    altPhone: '800-478-3121',
    methods: ['phone'],
    webPortal: 'https://akonecall.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'AZ-BLUESTAKE': {
    id: 'AZ-BLUESTAKE',
    name: 'Arizona Blue Stake, Inc.',
    state: 'AZ',
    country: 'US',
    area: 'Arizona',
    phone: '811',
    altPhone: '800-782-5348',
    methods: ['phone', 'web'],
    webPortal: 'https://azbluestake.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'AR-ONECALL': {
    id: 'AR-ONECALL',
    name: 'Arkansas One Call',
    state: 'AR',
    country: 'US',
    area: 'Arkansas',
    phone: '811',
    altPhone: '800-482-8998',
    methods: ['phone'],
    webPortal: 'https://arkonecall.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'CA-USANORTH': {
    id: 'CA-USANORTH',
    name: 'USA North 811',
    state: 'CA',
    country: 'US',
    area: 'Northern/Central California & Nevada',
    phone: '811',
    altPhone: '800-227-2600',
    methods: ['phone', 'web'],
    webPortal: 'https://www.usanorth.org',
    apiAvailable: true,
    emailAvailable: false,
    notes: 'Pre-marking required'
  },
  'CA-DIGALERT': {
    id: 'CA-DIGALERT',
    name: 'USA South 811 (DigAlert)',
    state: 'CA',
    country: 'US',
    area: 'Southern California',
    phone: '811',
    altPhone: '800-227-2600',
    methods: ['phone', 'web'],
    webPortal: 'https://www.digalert.org',
    apiAvailable: true,
    emailAvailable: false
  },
  'CO811': {
    id: 'CO811',
    name: 'Colorado 811 (UNCC)',
    state: 'CO',
    country: 'US',
    area: 'Colorado',
    phone: '811',
    altPhone: '800-922-1987',
    methods: ['phone', 'web'],
    webPortal: 'https://www.uncc.org',
    apiAvailable: false,
    emailAvailable: false
  },
  'CT-CBYD': {
    id: 'CT-CBYD',
    name: 'Connecticut Call Before You Dig (CBYD)',
    state: 'CT',
    country: 'US',
    area: 'Connecticut',
    phone: '811',
    altPhone: '800-922-4455',
    methods: ['phone', 'web'],
    webPortal: 'https://www.cbyd.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'DE-MISSUTILITY': {
    id: 'DE-MISSUTILITY',
    name: 'Miss Utility of Delmarva',
    state: 'DE',
    country: 'US',
    area: 'Delaware, Eastern Maryland',
    phone: '811',
    altPhone: '800-282-8555',
    methods: ['phone', 'web'],
    webPortal: 'https://www.missutility.net',
    apiAvailable: false,
    emailAvailable: false
  },
  'FL-SUNSHINE': {
    id: 'FL-SUNSHINE',
    name: 'Sunshine State One Call',
    state: 'FL',
    country: 'US',
    area: 'Florida',
    phone: '811',
    altPhone: '800-432-4770',
    methods: ['phone', 'web'],
    webPortal: 'https://www.callsunshine.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'GA811': {
    id: 'GA811',
    name: 'Georgia 811',
    state: 'GA',
    country: 'US',
    area: 'Georgia',
    phone: '811',
    altPhone: '800-282-7411',
    methods: ['phone', 'web'],
    webPortal: 'https://www.gaupc.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'HI-ONECALL': {
    id: 'HI-ONECALL',
    name: 'Hawaii One Call',
    state: 'HI',
    country: 'US',
    area: 'Hawaii',
    phone: '811',
    altPhone: '800-227-2600',
    methods: ['phone'],
    webPortal: 'https://callbeforeyoudig.org',
    apiAvailable: false,
    emailAvailable: false
  },
  'IL-JULIE': {
    id: 'IL-JULIE',
    name: 'J.U.L.I.E., Inc. (Illinois 1-Call)',
    state: 'IL',
    country: 'US',
    area: 'Illinois (outside Chicago)',
    phone: '811',
    altPhone: '800-892-0123',
    methods: ['phone', 'web'],
    webPortal: 'https://www.illinois1call.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'IN811': {
    id: 'IN811',
    name: 'Indiana 811',
    state: 'IN',
    country: 'US',
    area: 'Indiana',
    phone: '811',
    altPhone: '800-382-5544',
    methods: ['phone', 'web'],
    webPortal: 'https://www.indiana811.org',
    apiAvailable: false,
    emailAvailable: false
  },
  'IA-ONECALL': {
    id: 'IA-ONECALL',
    name: 'Iowa One Call',
    state: 'IA',
    country: 'US',
    area: 'Iowa',
    phone: '811',
    altPhone: '800-292-8989',
    methods: ['phone', 'web'],
    webPortal: 'https://www.iowaonecall.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'KS-ONECALL': {
    id: 'KS-ONECALL',
    name: 'Kansas One Call',
    state: 'KS',
    country: 'US',
    area: 'Kansas',
    phone: '811',
    altPhone: '800-344-7233',
    methods: ['phone', 'web'],
    webPortal: 'https://www.kansasonecall.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'KY811': {
    id: 'KY811',
    name: 'Kentucky 811',
    state: 'KY',
    country: 'US',
    area: 'Kentucky',
    phone: '811',
    altPhone: '800-752-6007',
    methods: ['phone', 'web'],
    webPortal: 'https://www.kentucky811.org',
    apiAvailable: false,
    emailAvailable: false
  },
  'LA-ONECALL': {
    id: 'LA-ONECALL',
    name: 'LA One Call',
    state: 'LA',
    country: 'US',
    area: 'Louisiana',
    phone: '811',
    altPhone: '800-272-3020',
    methods: ['phone', 'web'],
    webPortal: 'https://www.laonecall.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'DIGSAFE': {
    id: 'DIGSAFE',
    name: 'Dig Safe (New England)',
    state: 'MA',
    country: 'US',
    area: 'Maine, Massachusetts, Rhode Island, New Hampshire, Vermont',
    phone: '811',
    altPhone: '888-344-7233',
    methods: ['phone', 'web'],
    webPortal: 'https://www.digsafe.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'MI-MISSDIG': {
    id: 'MI-MISSDIG',
    name: 'Miss Dig System, Inc.',
    state: 'MI',
    country: 'US',
    area: 'Michigan',
    phone: '811',
    altPhone: '800-482-7171',
    methods: ['phone', 'web'],
    webPortal: 'https://www.missdig.org',
    apiAvailable: false,
    emailAvailable: false
  },
  'MN-GOPHERSTATE': {
    id: 'MN-GOPHERSTATE',
    name: 'Gopher State One Call',
    state: 'MN',
    country: 'US',
    area: 'Minnesota',
    phone: '811',
    altPhone: '800-252-1166',
    methods: ['phone', 'web'],
    webPortal: 'https://www.gopherstateonecall.org',
    apiAvailable: false,
    emailAvailable: false
  },
  'MS811': {
    id: 'MS811',
    name: 'Mississippi 811',
    state: 'MS',
    country: 'US',
    area: 'Mississippi',
    phone: '811',
    altPhone: '800-227-6477',
    methods: ['phone', 'web'],
    webPortal: 'https://www.ms1call.org',
    apiAvailable: false,
    emailAvailable: false
  },
  'MO-ONECALL': {
    id: 'MO-ONECALL',
    name: 'Missouri One Call System',
    state: 'MO',
    country: 'US',
    area: 'Missouri',
    phone: '811',
    altPhone: '800-344-7483',
    methods: ['phone', 'web'],
    webPortal: 'https://www.mo1call.org',
    apiAvailable: false,
    emailAvailable: false
  },
  'NE811': {
    id: 'NE811',
    name: 'Nebraska 811',
    state: 'NE',
    country: 'US',
    area: 'Nebraska',
    phone: '811',
    altPhone: '800-331-5666',
    methods: ['phone', 'web'],
    webPortal: 'https://ne1call.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'NJ-ONECALL': {
    id: 'NJ-ONECALL',
    name: 'New Jersey One Call',
    state: 'NJ',
    country: 'US',
    area: 'New Jersey',
    phone: '811',
    altPhone: '800-272-1000',
    methods: ['phone', 'web'],
    webPortal: 'https://www.nj1-call.org',
    apiAvailable: false,
    emailAvailable: false
  },
  'NM-ONECALL': {
    id: 'NM-ONECALL',
    name: 'New Mexico One Call',
    state: 'NM',
    country: 'US',
    area: 'New Mexico',
    phone: '811',
    altPhone: '800-321-2537',
    methods: ['phone', 'web'],
    webPortal: 'https://www.nmonecall.org',
    apiAvailable: false,
    emailAvailable: false
  },
  'NY-DIGSAFELY': {
    id: 'NY-DIGSAFELY',
    name: 'Dig Safely New York',
    state: 'NY',
    country: 'US',
    area: 'New York (upstate)',
    phone: '811',
    altPhone: '800-962-7962',
    methods: ['phone', 'web'],
    webPortal: 'https://www.digsafelynewyork.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'NC811': {
    id: 'NC811',
    name: 'North Carolina 811',
    state: 'NC',
    country: 'US',
    area: 'North Carolina',
    phone: '811',
    altPhone: '800-632-4949',
    methods: ['phone', 'web'],
    webPortal: 'https://www.nc811.org',
    apiAvailable: false,
    emailAvailable: false
  },
  'ND-ONECALL': {
    id: 'ND-ONECALL',
    name: 'North Dakota One Call',
    state: 'ND',
    country: 'US',
    area: 'North Dakota',
    phone: '811',
    altPhone: '800-795-0555',
    methods: ['phone', 'web'],
    webPortal: 'https://www.ndonecall.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'OH811': {
    id: 'OH811',
    name: 'Ohio Utilities Protection Service',
    state: 'OH',
    country: 'US',
    area: 'Ohio',
    phone: '811',
    altPhone: '800-362-2764',
    methods: ['phone', 'web'],
    webPortal: 'https://oups.org',
    apiAvailable: false,
    emailAvailable: false,
    notes: 'i-dig remote ticket entry for contractors'
  },
  'OK-CALLOKIE': {
    id: 'OK-CALLOKIE',
    name: 'Call Okie',
    state: 'OK',
    country: 'US',
    area: 'Oklahoma',
    phone: '811',
    altPhone: '800-522-6543',
    methods: ['phone', 'web'],
    webPortal: 'https://www.callokie.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'OR-CALLBEFOREYOUDIG': {
    id: 'OR-CALLBEFOREYOUDIG',
    name: 'Oregon Utility Notification Center',
    state: 'OR',
    country: 'US',
    area: 'Oregon',
    phone: '811',
    altPhone: '800-332-2344',
    methods: ['phone', 'web'],
    webPortal: 'https://www.digsafelyoregon.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'PA-ONECALL': {
    id: 'PA-ONECALL',
    name: 'Pennsylvania One Call System, Inc.',
    state: 'PA',
    country: 'US',
    area: 'Pennsylvania',
    phone: '811',
    altPhone: '800-242-1776',
    methods: ['phone', 'web'],
    webPortal: 'https://www.paonecall.org',
    apiAvailable: false,
    emailAvailable: false
  },
  'SC811': {
    id: 'SC811',
    name: 'South Carolina 811 (SC1PUPS)',
    state: 'SC',
    country: 'US',
    area: 'South Carolina',
    phone: '811',
    altPhone: '800-922-0983',
    methods: ['phone', 'web'],
    webPortal: 'https://www.sc1pups.org',
    apiAvailable: false,
    emailAvailable: false
  },
  'SD-ONECALL': {
    id: 'SD-ONECALL',
    name: 'South Dakota One Call',
    state: 'SD',
    country: 'US',
    area: 'South Dakota',
    phone: '811',
    altPhone: '800-781-7474',
    methods: ['phone', 'web'],
    webPortal: 'https://www.sdonecall.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'TN811': {
    id: 'TN811',
    name: 'Tennessee 811',
    state: 'TN',
    country: 'US',
    area: 'Tennessee',
    phone: '811',
    altPhone: '800-351-1111',
    methods: ['phone', 'web'],
    webPortal: 'https://www.tennessee811.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'TX-LONESTAR': {
    id: 'TX-LONESTAR',
    name: 'Lone Star 811',
    state: 'TX',
    country: 'US',
    area: 'Texas (eastern/southern)',
    phone: '811',
    altPhone: '800-669-8344',
    methods: ['phone', 'web'],
    webPortal: 'https://www.lonestar811.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'TX-TEXAS811': {
    id: 'TX-TEXAS811',
    name: 'Texas811',
    state: 'TX',
    country: 'US',
    area: 'Texas (northwest)',
    phone: '811',
    altPhone: '800-344-8377',
    methods: ['phone', 'web'],
    webPortal: 'https://www.texas811.org',
    apiAvailable: false,
    emailAvailable: false
  },
  'UT-BLUESTAKES': {
    id: 'UT-BLUESTAKES',
    name: 'Blue Stakes (One-Call of Utah)',
    state: 'UT',
    country: 'US',
    area: 'Utah',
    phone: '811',
    altPhone: '800-662-4111',
    methods: ['phone', 'web'],
    webPortal: 'https://www.bluestakes.org',
    apiAvailable: false,
    emailAvailable: false
  },
  'VA-MISSUTILITY': {
    id: 'VA-MISSUTILITY',
    name: 'Miss Utility of Virginia',
    state: 'VA',
    country: 'US',
    area: 'Virginia',
    phone: '811',
    altPhone: '800-552-7001',
    methods: ['phone', 'web'],
    webPortal: 'https://www.missutilityofvirginia.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'WA-CALLBEFOREYOUDIG': {
    id: 'WA-CALLBEFOREYOUDIG',
    name: 'Utility Notification Center',
    state: 'WA',
    country: 'US',
    area: 'Washington',
    phone: '811',
    altPhone: '800-332-2344',
    methods: ['phone', 'web'],
    webPortal: 'https://www.callbeforeyoudig.org',
    apiAvailable: false,
    emailAvailable: false
  },
  'WV-MISSUTILITY': {
    id: 'WV-MISSUTILITY',
    name: 'Miss Utility of West Virginia',
    state: 'WV',
    country: 'US',
    area: 'West Virginia',
    phone: '811',
    altPhone: '800-245-4848',
    methods: ['phone', 'web'],
    webPortal: 'https://www.muwv.org',
    apiAvailable: false,
    emailAvailable: false
  },
  'WI-DIGGERSHOTLINE': {
    id: 'WI-DIGGERSHOTLINE',
    name: 'Diggers Hotline',
    state: 'WI',
    country: 'US',
    area: 'Wisconsin',
    phone: '811',
    altPhone: '800-242-8511',
    methods: ['phone', 'web'],
    webPortal: 'https://www.diggershotline.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'WY-ONECALL': {
    id: 'WY-ONECALL',
    name: 'One-Call of Wyoming',
    state: 'WY',
    country: 'US',
    area: 'Wyoming',
    phone: '811',
    altPhone: '800-849-2476',
    methods: ['phone', 'web'],
    webPortal: 'https://www.onecallofwyoming.com',
    apiAvailable: false,
    emailAvailable: false
  },

  // Canada
  'AB-UTILITYSAFETY': {
    id: 'AB-UTILITYSAFETY',
    name: 'Alberta One-Call (Utility Safety Partners)',
    province: 'AB',
    country: 'CA',
    area: 'Alberta',
    phone: '1-800-242-3447',
    methods: ['phone', 'web'],
    webPortal: 'https://utilitysafety.ca',
    apiAvailable: false,
    emailAvailable: false,
    notes: 'Where\'s the Line portal'
  },
  'BC-1CALL': {
    id: 'BC-1CALL',
    name: 'BC One Call',
    province: 'BC',
    country: 'CA',
    area: 'British Columbia',
    phone: '1-800-474-6886',
    methods: ['phone', 'web'],
    webPortal: 'https://www.bc1c.ca',
    apiAvailable: false,
    emailAvailable: false
  },
  'SK-1STCALL': {
    id: 'SK-1STCALL',
    name: 'Saskatchewan 1st Call',
    province: 'SK',
    country: 'CA',
    area: 'Saskatchewan',
    phone: '1-866-828-4888',
    methods: ['phone', 'web'],
    webPortal: 'https://www.sask1stcall.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'MB-CLICKBEFOREYOUDIG': {
    id: 'MB-CLICKBEFOREYOUDIG',
    name: 'ClickBeforeYouDig MB',
    province: 'MB',
    country: 'CA',
    area: 'Manitoba',
    phone: '1-800-940-3447',
    methods: ['phone', 'web'],
    webPortal: 'https://clickbeforeyoudigmb.com',
    apiAvailable: false,
    emailAvailable: false
  },
  'ON-ONECALL': {
    id: 'ON-ONECALL',
    name: 'Ontario One Call',
    province: 'ON',
    country: 'CA',
    area: 'Ontario',
    phone: '1-800-400-2255',
    methods: ['phone', 'web'],
    webPortal: 'https://ontarioonecall.ca',
    apiAvailable: false,
    emailAvailable: false,
    notes: 'Submit request 5+ business days ahead'
  },
  'QC-INFOEX': {
    id: 'QC-INFOEX',
    name: 'Info-Excavation',
    province: 'QC',
    country: 'CA',
    area: 'Québec, New Brunswick, Nova Scotia, Prince Edward Island, Newfoundland & Labrador',
    phone: '1-800-663-9228',
    methods: ['phone', 'web'],
    webPortal: 'https://www.info-ex.com',
    apiAvailable: false,
    emailAvailable: false
  }
};

// Helper function to find district by state/province and address
const findDistrictByLocation = (state, country = 'US') => {
  const results = [];
  
  for (const [key, district] of Object.entries(districts)) {
    if (district.country === country) {
      if (country === 'US' && district.state === state) {
        results.push(district);
      } else if (country === 'CA' && district.province === state) {
        results.push(district);
      }
    }
  }
  
  return results;
};

// Get all districts
const getAllDistricts = () => {
  return Object.values(districts);
};

// Get district by ID
const getDistrictById = (districtId) => {
  return districts[districtId] || null;
};

module.exports = {
  districts,
  findDistrictByLocation,
  getAllDistricts,
  getDistrictById
};