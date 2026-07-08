// Sample data for the preview — shaped like the GSIC Programs table
// (Program Name / Status / Date / Program Type / Estimated Attendance).

export const TABLE_NAME = 'GSIC Programs';

export const FIELDS = [
    {id: 'fldName', name: 'Program Name', type: 'singleLineText', isPrimaryField: true, options: null},
    {
        id: 'fldStatus',
        name: 'Status',
        type: 'singleSelect',
        isPrimaryField: false,
        options: {
            choices: [
                {name: 'Completed', color: 'greenBright'},
                {name: 'Scheduled', color: 'blueBright'},
                {name: 'In Planning', color: 'yellowBright'},
                {name: 'Cancelled', color: 'redBright'},
            ],
        },
    },
    {id: 'fldDate', name: 'Date', type: 'dateTime', isPrimaryField: false, options: null},
    {
        id: 'fldType',
        name: 'Program Type',
        type: 'singleSelect',
        isPrimaryField: false,
        options: {
            choices: [
                {name: 'Workshop', color: 'purpleBright'},
                {name: 'Convening', color: 'tealBright'},
                {name: 'Webinar', color: 'cyanBright'},
                {name: 'Meetup', color: 'orangeBright'},
            ],
        },
    },
    {id: 'fldAttendance', name: 'Estimated Attendance', type: 'number', isPrimaryField: false, options: {precision: 0}},
];

const PROGRAMS = [
    ['Impact Investing 101 Workshop', 'Completed', '2026-01-22', 'Workshop', 42],
    ['Q1 Ecosystem Convening', 'Completed', '2026-02-12', 'Convening', 118],
    ['Faith-Based Investing Webinar', 'Completed', '2026-02-26', 'Webinar', 87],
    ['Atlanta Impact Finance Meetup', 'Completed', '2026-03-05', 'Meetup', 35],
    ['Foundation Toolkit Launch', 'Completed', '2026-03-19', 'Webinar', 140],
    ['Capital Access Workshop', 'Completed', '2026-04-09', 'Workshop', 51],
    ['Spring Investor Roundtable', 'Completed', '2026-04-23', 'Convening', 64],
    ['Nonprofit Finance Meetup', 'Completed', '2026-05-07', 'Meetup', 29],
    ['Measuring Impact Webinar', 'Completed', '2026-05-21', 'Webinar', 96],
    ['Q2 Ecosystem Convening', 'Completed', '2026-06-11', 'Convening', 132],
    ['Place-Based Capital Workshop', 'Completed', '2026-06-25', 'Workshop', 47],
    ['Summer Impact Meetup', 'Scheduled', '2026-07-16', 'Meetup', 40],
    ['CDFI Partnership Webinar', 'Scheduled', '2026-07-30', 'Webinar', 75],
    ['Investor Activation Workshop', 'Scheduled', '2026-08-13', 'Workshop', 55],
    ['Q3 Ecosystem Convening', 'In Planning', '2026-09-17', 'Convening', 125],
    ['Fall Funder Briefing', 'In Planning', '2026-10-08', 'Webinar', 90],
    ['Rural Georgia Listening Tour', 'In Planning', '2026-10-22', 'Convening', 60],
    ['Legacy Gala Planning Session', 'Cancelled', '2026-03-27', 'Meetup', 0],
];

const STATUS_COLORS = {Completed: 'greenBright', Scheduled: 'blueBright', 'In Planning': 'yellowBright', Cancelled: 'redBright'};
const TYPE_COLORS = {Workshop: 'purpleBright', Convening: 'tealBright', Webinar: 'cyanBright', Meetup: 'orangeBright'};

export const RECORDS = PROGRAMS.map(([name, status, date, type, attendance], i) => ({
    id: `rec${String(i).padStart(14, '0')}`,
    name,
    cells: {
        fldName: name,
        fldStatus: {id: `sel${i}a`, name: status, color: STATUS_COLORS[status]},
        fldDate: `${date}T18:00:00.000Z`,
        fldType: {id: `sel${i}b`, name: type, color: TYPE_COLORS[type]},
        fldAttendance: attendance,
    },
}));
