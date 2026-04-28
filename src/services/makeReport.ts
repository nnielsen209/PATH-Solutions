/**
 * makeReport.ts - takes data from a class roster and generates pdf reports
 *
 * 
 * 
 * 
 */

import { jsPDF } from'jspdf';
import { applyPlugin, autoTable } from 'jspdf-autotable';

interface rosterRow{
    id: string;
    scout: dbScout;
    troop: dbTroop;
    attendance: dbAttendance;
    reqs: dbScout_badge_rqmt[];
    sBadge: dbScout_badge;
    badge_id: string;
};

interface dbActivity{
  id: string;
  name: string;
  periodID: string;
  time?: string;
};

interface dbAttendance{
    activity_id: string;
    scout_id: string;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;

}

interface dbScout_badge{
    scout_badge_id: string;
    scout_id: string;
    completed: boolean;
    badge_id: string;
}

interface dbScout_badge_rqmt{
    scout_badge_rqmt_id: string;
    scout_badge_id: string;
    rqmt_id: string;
    completed: boolean;
}

interface dbMerit_badge_rqmt{
    rqmt_id: string;
    rqmt_idnf: string;
    parent_rqmt_id?: string;
    badge_id: string;
}

interface dbScout{
    scout_id: string;
    scout_first_name: string;
    scout_last_name: string;
    troop_id: string;
}

interface dbTroop{
    troop_id: string;
    troop_nmbr: number;
    troop_type: string;
    troop_city?: string;
    troop_state?: string;
    troop_council?: string;
}

const boolToAttend = (bool: boolean) => {
    if(bool) return "O";
    else return "X";
}

const boolToComplete = (bool: boolean) => {
    if(bool) return "C";
    else return "I";
}

export async function makeAttendanceRoster(
rosterData:rosterRow[], activity: dbActivity, rqmtList1: dbMerit_badge_rqmt[], rqmtList2: dbMerit_badge_rqmt[]){

    const rqmtIdnfs1: string[] = rqmtList1.map(d => d.rqmt_idnf);
    const rqmtIdnfs2: string[] = rqmtList2.map(d => d.rqmt_idnf);
    const badge1Id = rqmtList1[0].badge_id;
    var badge2Id = ""
    if(rqmtList2.length > 0){
        badge2Id = rqmtList2[0].badge_id;
    }
    

    const headers: string[] = [
        "Name",
        "Troop",
        "Troop type",
        "M",
        "T",
        "W",
        "Th",
        "F",
        ...rqmtIdnfs1,
        "Completed"
    ];

    const headers2: string[] = [
        "Name",
        "Troop",
        "Type",
        "M",
        "T",
        "W",
        "Th",
        "F",
        ...rqmtIdnfs2,
        "Completed"
    ];

    const rows = (badgeID: string) =>  { 

        return rosterData.filter(r => r.badge_id === badgeID).map( rost => {

            const sortSBreqs = (orderList: dbMerit_badge_rqmt[], unsorted: dbScout_badge_rqmt[]): dbScout_badge_rqmt[] => {

                const orderMap: Record<string, number> = {};
                orderList.forEach( (req, i) => {
                    orderMap[req.rqmt_id] = i;
                })

                return unsorted.sort( (a, b) => {
                    const aInd = orderMap[a.rqmt_id];
                    const bInd = orderMap[b.rqmt_id];

                    return aInd - bInd;
                })
            }

            const sortedReqs = sortSBreqs(rqmtList1, rost.reqs)
            const sortedReqBools: string[] = sortedReqs.map(r => boolToComplete(r.completed));

            return [
                rost.scout.scout_first_name+" "+rost.scout.scout_last_name,
                rost.troop.troop_nmbr.toString(),
                rost.troop.troop_type,
                boolToAttend(rost.attendance.monday),
                boolToAttend(rost.attendance.tuesday),
                boolToAttend(rost.attendance.wednesday),
                boolToAttend(rost.attendance.thursday),
                boolToAttend(rost.attendance.friday),
                ...sortedReqBools,
                boolToComplete(rost.sBadge.completed)
            ];
        });
    }

    const rows1 = rows(badge1Id);
    var rows2: string[][] = []
    if(badge2Id) {
        rows2 = rows(badge2Id);
    };

    const [name1, name2] = activity.name.split(";");

    const doc = new jsPDF('l');
    doc.text(activity.name+" "+activity.time, 14, 15);

    if(rows2.length > 1) {
        doc.text(name1, 14, 25)
    };

    autoTable(doc, {
        head: [headers],
        body: rows1,
        startY: 30,
        horizontalPageBreak: true,
        horizontalPageBreakRepeat: 0,
        styles: {font: 'courier', overflow: 'linebreak'},
        tableWidth: 'auto'
    });

    const yLoc = (doc as any).lastAutoTable.finalY;

    if(rows2.length > 1){
        doc.addPage();
        doc.text(name2, 14, 15);
        autoTable(doc, {
            head: [headers2],
            body: rows2,
            horizontalPageBreak: true,
            horizontalPageBreakRepeat: 0,
            styles: {font: 'courier'},
            startY: 20
        })
    }

    doc.save(activity.name+activity.time+".pdf");

}

export async function makeProgressReport(rosterData: rosterRow, activity: dbActivity, reqList: dbMerit_badge_rqmt[],
data2?: rosterRow, reqs2?: dbMerit_badge_rqmt[]) {
    
    const reqPairs = (sbReqs: dbScout_badge_rqmt[], idnfs: dbMerit_badge_rqmt[]): string[][] => {

        const pairs: string[][] = sbReqs.map( sbr => {
            const bool = boolToComplete(sbr.completed);
            const idnf = idnfs.find( r => r.rqmt_id === sbr.rqmt_id)?.rqmt_idnf || "";
            return [idnf, bool];
        })
        return pairs;

    }
    

    const doc = new jsPDF();

    const [name1, name2] = activity.name.split(';');

    doc.text([
        rosterData.scout.scout_first_name+" "+rosterData.scout.scout_last_name+"\t"+
        rosterData.troop.troop_nmbr+"\t"+rosterData.troop.troop_type,
        name1],
        14, 15
    );

    autoTable(doc, {
        head: [[
            "Monday", 
            "Tuesday", 
            "Wednesday", 
            "Thursday", 
            "Friday"
        ]],
        body: [[
            boolToAttend(rosterData.attendance.monday),
            boolToAttend(rosterData.attendance.tuesday),
            boolToAttend(rosterData.attendance.wednesday),
            boolToAttend(rosterData.attendance.thursday),
            boolToAttend(rosterData.attendance.friday),
        ]],
        styles: {font: 'courier', overflow: 'linebreak'},
        startY: 30
    });

    var lastY = (doc as any).lastAutoTable.finalY

    autoTable(doc, {
        head: [["Requirement", "Completion"]],
        body: [...reqPairs(rosterData.reqs, reqList)],
        styles: {font: 'courier', overflow: 'linebreak'},
        startY: lastY+5
    })

    lastY = (doc as any).lastAutoTable.finalY

    doc.text("Overall badge completion: "+boolToComplete(rosterData.sBadge.completed), 14, lastY+5);

    if(reqs2 && data2){

        doc.addPage();

        doc.text(name2, 14, 15);

        autoTable(doc, {
        head: [["Requirement", "Completion"]],
        body: [reqPairs(data2.reqs, reqs2)],
        styles: {font: 'courier', overflow: 'linebreak'},
        startY: lastY+5
        })

        lastY = (doc as any).lastAutoTable.finalY;

        doc.text("Overall badge completion: "+boolToComplete(data2.sBadge.completed), 14, lastY+5);

    }

    doc.save(rosterData.scout.scout_last_name+activity.name+".pdf");

}