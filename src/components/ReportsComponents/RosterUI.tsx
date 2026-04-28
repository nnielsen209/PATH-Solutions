/**
 * RosterUI.tsx - UI for entering and viewing attendance and completion
 *
 * The primary interface for instructors to log records
 * 
 */
import React, { useCallback, useEffect, useState } from "react";
import{
    View,
    Text,
    FlatList,
    ScrollView,
    ListRenderItem,
    Pressable,
    ActivityIndicator
} from "react-native";
import { styles, ACCENT_COLOR } from "../../styles/ReportsStyles";
import { Checkbox } from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { makeAttendanceRoster, makeProgressReport } from "../../services/makeReport";


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

interface rosterRow{
    id: string;
    scout: dbScout;
    troop: dbTroop;
    attendance: dbAttendance;
    reqs: dbScout_badge_rqmt[];
    sBadge: dbScout_badge;
    badge_id: string;
};

interface rosterBackup{
    id: string;
    change_id?: string;
    save_state: rosterRow;
}

interface rosterUpdate{
    id: string;
    state: rosterRow;
}








export const RosterUI = (activity: dbActivity) => {

    const [rosterData, setRosterData] = useState<rosterRow[]>([]);
    const [rowBackups, setRowBackups] = useState<rosterBackup[]>([]);
    const [pendingChanges, setPendingchanges] = useState<{
        created: rosterUpdate[];
        updated: rosterUpdate[];
        deleted: rosterUpdate[];
    }>({ created: [], updated: [], deleted: [] });


    const [isLoading, setIsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string>("");
    const [badge1ID, setBadge1ID] = useState<string>("");
    const [badge2ID, setBadge2ID] = useState<string>("");
    const [isMultibadge, setMultibadge] = useState<boolean>(false);
    const [rqmtList1, setRqmtList1] = useState<dbMerit_badge_rqmt[]>([]);
    const [rqmtList2, setRqmtList2] = useState<dbMerit_badge_rqmt[]>([]);
    

    const fetchRosterData = useCallback(async () =>{
        try{
            setError("");
            setIsLoading(true);

            const [actBadgeResp, attendResp] = await Promise.all([
                supabase.from("activity_badge").select('badge_id').eq('activity_id', activity.id),
                supabase.from('attendance').select(`
                    activity_id,
                    scout_id,
                    monday,
                    tuesday,
                    wednesday,
                    thursday,
                    friday
                    `).eq('activity_id', activity.id),
            ]);

            if( actBadgeResp.error) throw error;
            if( attendResp.error) throw error;

            const badgeIDRecords: string[] = actBadgeResp.data.map( (badge) => (badge.badge_id)) || [];
            const attendRecords: dbAttendance[] = attendResp.data || [];

            if (badgeIDRecords.length > 1) {
                setMultibadge(true);
                setBadge2ID(badgeIDRecords[1])
            };
            setBadge1ID(badgeIDRecords[0]);
           

            const scouts = attendRecords.map( (scout) => (scout.scout_id));


            const [scoutBadgeResp] = await Promise.all([
                supabase.from("scout_badge").select(`
                    scout_badge_id,
                    scout_id,
                    completed,
                    badge_id
                    `).in('badge_id', badgeIDRecords)
                    .in('scout_id', scouts)
                ]);

            if (scoutBadgeResp.error) throw error;
            
            const scoutBadgeRecords: dbScout_badge[] = scoutBadgeResp.data || [];
            const scoutBadges = scoutBadgeRecords.map( (sbadge) => (sbadge.scout_badge_id));

            const [scoutBadgeRqmtResp, meritBadgeRqmtResp] = await Promise.all([
                supabase.from("scout_badge_rqmt").select(`
                    scout_badge_rqmt_id,
                    scout_badge_id,
                    rqmt_id,
                    completed
                    `).in('scout_badge_id', scoutBadges),
                supabase.from('merit_badge_rqmt').select(`
                    rqmt_id,
                    rqmt_idnf,
                    parent_rqmt_id,
                    badge_id
                    `).in('badge_id', badgeIDRecords)
            ]);

            if (scoutBadgeRqmtResp.error) throw error;
            if (meritBadgeRqmtResp.error) throw error;

            const scoutBadgeRqmtRecords: dbScout_badge_rqmt[] = scoutBadgeRqmtResp.data || [];
            const meritBadgeRqmtRecords: dbMerit_badge_rqmt[] = meritBadgeRqmtResp.data || [];

            const badge1Reqs = sortMBReqs(meritBadgeRqmtRecords.filter(d => d.badge_id === badgeIDRecords[0]));
            setRqmtList1(badge1Reqs);

            
            const badge2Reqs = sortMBReqs(meritBadgeRqmtRecords.filter(d => d.badge_id === badgeIDRecords[1]));
            setRqmtList2(badge2Reqs);
            

            const [scoutResp] = await Promise.all([
                supabase.from('scout').select(`
                    scout_first_name,
                    scout_last_name,
                    troop_id,
                    scout_id
                    `).in('scout_id', scouts)
            ]);

            if (scoutResp.error) throw error;

            const scoutRecords: dbScout[] = scoutResp.data || [];
            const troopIDs = scoutRecords.map( (record) => (record.troop_id));

            const [troopResp] = await Promise.all([
                supabase.from('troop').select(`
                    troop_nmbr,
                    troop_type,
                    troop_city,
                    troop_state,
                    troop_council,
                    troop_id
                    `).in('troop_id', troopIDs)
            ])

            if (troopResp.error) {throw error};

            const troopRecords: dbTroop[] = troopResp.data || [];


            var rows: rosterRow[] = [];

            scouts.map( (scoutID) => {

                const scoutRec = scoutRecords.find( (scout) => scout.scout_id === scoutID);
                if (!scoutRec) throw error;

                const troopRec = troopRecords.find( (troop) => troop.troop_id === scoutRec.troop_id);
                if (!troopRec) throw error;

                const attendRec = attendRecords.find( (attend) => attend.scout_id === scoutRec.scout_id);
                if (!attendRec) throw error;

                const sBadgeRec = scoutBadgeRecords.find( (sBadge) => 
                    sBadge.scout_id === scoutRec.scout_id && sBadge.badge_id === badgeIDRecords[0]);
                
                if (!sBadgeRec) throw error;

                const reqsRecs = scoutBadgeRqmtRecords.filter( (req) => 
                    req.scout_badge_id === sBadgeRec.scout_badge_id);
                if (reqsRecs.length === 0) throw error;

                const row1: rosterRow = {
                    id: scoutRec.scout_id,
                    scout: scoutRec,
                    troop: troopRec,
                    attendance: attendRec,
                    reqs: sortSBreqs(badge1Reqs, reqsRecs),
                    sBadge: sBadgeRec,
                    badge_id: badgeIDRecords[0]
                };

                rows.push(row1);

                if(badgeIDRecords.length > 1){

                    const sBadgeRec2 = scoutBadgeRecords.find( (sBadge) => 
                    sBadge.scout_id === scoutRec.scout_id && sBadge.badge_id === badgeIDRecords[1]);
                
                    if (!sBadgeRec2) throw error;

                    const reqsRecs2 = scoutBadgeRqmtRecords.filter( (req) => 
                    req.scout_badge_id === sBadgeRec2.scout_badge_id);
                    if (!reqsRecs2) throw error;

                    const row2 = {
                        id: (row1.id+"ROW2"),
                        scout: row1.scout,
                        troop: row1.troop,
                        attendance: row1.attendance,
                        reqs: sortSBreqs(badge2Reqs, reqsRecs2),
                        sBadge: sBadgeRec2,
                        badge_id: badgeIDRecords[1]
                    };

                    rows.push(row2);

                }
            });

            setRosterData(rows);
            setRowBackups(rows.map( (row, index) => ({
                id: index.toString(),
                change_id: "unchanged",
                save_state: row
            })))

        }
        catch (error){
            console.error('Error fetching data:', error);
            setError('Failed to load roster data');
        }
        finally{
            setIsLoading(false);
        }
    }, []);

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

    const sortMBReqs = (retrieved: dbMerit_badge_rqmt[]): dbMerit_badge_rqmt[] => {

        // Create a map for quick lookup
        const map: Record<string, dbMerit_badge_rqmt> = {};
        const children: Record<string, dbMerit_badge_rqmt[]> = {};

        // Initialize map and children
        retrieved.forEach((item) => {
            map[item.rqmt_id] = item;
            children[item.rqmt_id] = [];
        });

        // Build the hierarchy
        retrieved.forEach((item) => {
            if (item.parent_rqmt_id) {
                children[item.parent_rqmt_id].push(item);
            }
        });

        // Recursive function to sort the hierarchy
        const sortHierarchy = (ancestors: dbMerit_badge_rqmt[], siblings: dbMerit_badge_rqmt[]): dbMerit_badge_rqmt[] => {

            var sortedLevel: dbMerit_badge_rqmt[] = [];
            
            siblings.sort((a, b) =>
                a.rqmt_idnf.localeCompare(b.rqmt_idnf, undefined, { numeric: true, sensitivity: 'base' })
            );

            if(siblings.length === 0){
                return ancestors;
            }
            else if(ancestors.length === 0){
                sortedLevel = siblings;
            }
            else{
                const parentID = siblings[0].parent_rqmt_id;
                const parentOb = ancestors.find(d => d.rqmt_id === parentID);
                if(parentOb){
                    const parentInd = ancestors.indexOf(parentOb);
                    const preElements = ancestors.filter ( n => ancestors.indexOf(n)<=parentInd)
                    const postElements = ancestors.filter (n => ancestors.indexOf(n)>parentInd)
                    sortedLevel = [...preElements, ...siblings, ...postElements]
                }
            }
            
            siblings.forEach( sib => {
                if(children[sib.rqmt_id]){

                    const nextGen = children[sib.rqmt_id];

                    sortedLevel = sortHierarchy(sortedLevel, nextGen);

                }
            });
            return sortedLevel;
        };

        const roots = retrieved.filter((item) => !item.parent_rqmt_id);


        const sorted: dbMerit_badge_rqmt[] = sortHierarchy([], roots);

        return sorted;

    };

    const addUpdate = (toAdd: rosterRow) => {

        const update: rosterUpdate = {
            id: Date.now().toString()+"UPDATE",
            state: toAdd
        }
        // if(pendingChanges.updated.find(change => change.state.id === update.state.id)){
        //     setPendingchanges({...pendingChanges, updated: pendingChanges.updated.map( change => {
        //         if(change.state.id === update.state.id){
        //             change = update;
        //         }
        //         return change;
        //     })})
        // }
        // setPendingchanges( {...pendingChanges, updated: [...pendingChanges.updated, update] });

        setPendingchanges((prevPendingChanges) => {
        // Check for existing update in the latest state
            const existingIndex = prevPendingChanges.updated.findIndex(
            (change) => change.state.id === update.state.id
            );

            let newUpdated;
            if (existingIndex >= 0) {
                // Replace existing update
                newUpdated = prevPendingChanges.updated.map((change, index) =>
                 index === existingIndex ? update : change
                );
            } else {
                // Add new update
                    newUpdated = [...prevPendingChanges.updated, update];
            }

            return {
                ...prevPendingChanges,
                updated: newUpdated,
            };
        });

        return update;

    };
    const addBackup = (toAdd: rosterRow, change_id: string) => {

        const backup: rosterBackup = {
            id: Date.now().toString()+"BACKUP",
            change_id: change_id,
            save_state: toAdd
        }

        if(rowBackups.find(row => row.id === backup.save_state.id)){
            setRowBackups(rowBackups.map( row => {
                if(row.id === backup.save_state.id){
                    row = backup;
                }
                return row;
            }))
        }else{
            setRowBackups([...rowBackups, backup])
        }

        return backup;
    }

    const rollback = (change: rosterUpdate) => {

        if(pendingChanges.deleted.find( (pend) => (pend.id === change.id))){

            var backup = rowBackups.find( (row) => (row.id === change.state.id));

            if(backup){
                setRosterData([ ...rosterData, backup.save_state ]);
            

            setPendingchanges( {...pendingChanges, 
                deleted: pendingChanges.deleted.filter( (row) => (row.id === change.id) ) } );

            }
        }
        else if(pendingChanges.created.find( (pend) => (pend.id === change.id))){

            setRosterData( rosterData.filter( (row) => (row.id != change.state.id)) );

            setPendingchanges( {...pendingChanges, 
                created: pendingChanges.created.filter( (row) => (row.id === change.id) ) } );

        }
        else if(pendingChanges.updated.find( (pend) => (pend.id === change.id))){

            setRosterData(rosterData.map( (row) => {
                
                if(row.id === change.state.id){
                    row = rowBackups.find( (backup) => (row.id === backup.save_state.id))?.save_state || row;
                }
                return row;
            }));

            setPendingchanges( {...pendingChanges, 
                updated: pendingChanges.updated.filter( (row) => (row.id === change.id) ) } );
                
        } 

    }

    const toggleNestedCheckbox = (rowID: string, rowKey: keyof rosterRow,  childKey: string) => {
        setRosterData(
            rosterData.map( (row) => {
                
                if (row.id === rowID){

                    var backupState = row;

                    if( rowKey == "reqs"){
                        row = { 
                            ...row,
                            ['reqs']: row.reqs.map( (req) => 
                                req.scout_badge_rqmt_id === childKey?({
                                    ...req,
                                    ['completed']: !req['completed']
                                }) : req
                            )
                        }

                    

                    }else{
                        row = { 
                            ...row, 
                            [rowKey]: {
                                ...(row[rowKey] as Record<string, any>),
                                [childKey]: !(row[rowKey] as Record<string, any>)[childKey]
                            }
                        }
                    }

                    var update = addUpdate(row);
                    addBackup(backupState, update.id);


                }
                

                return row;
                

            })
        )
    };

    const renderHeader = (thisBadge: string, first: boolean) => (
        <View style={styles.rosterLabelRow}>

            <View style={styles.reportButton2}>
                <Text>   </Text>
            </View>

            <Text style={[styles.rosterlabelCell, styles.nameCell]}>Name</Text>
            <Text style={[styles.rosterlabelCell, styles.troopCell]}>Troop</Text>
            <Text style={[styles.rosterlabelCell, styles.typeCell]}>B/C/G</Text>

            <Text style={[styles.rosterlabelCell, styles.boxCell]}>M</Text>
            <Text style={[styles.rosterlabelCell, styles.boxCell]}>T</Text>
            <Text style={[styles.rosterlabelCell, styles.boxCell]}>W</Text>
            <Text style={[styles.rosterlabelCell, styles.boxCell]}>Th</Text>
            <Text style={[styles.rosterlabelCell, styles.boxCell]}>F</Text>

            {first && rqmtList1?.map( (req) => (
                <Text key={req.rqmt_id} style={[styles.rosterlabelCell, styles.boxCell]}>{req.rqmt_idnf}</Text>
            ))}

            {!first && rqmtList2?.map( (req) => (
                <Text key={req.rqmt_id} style={[styles.rosterlabelCell, styles.boxCell]}>{req.rqmt_idnf}</Text>
            ))}

            <Text style={[styles.rosterlabelCell, styles.completeCell]}>Complete</Text>
            
        </View>
    );

    const renderRow: ListRenderItem<rosterRow> = ({item}) => (
        <View style={styles.rosterRow}>
            <Pressable 
                onPress={ () => makeProgressReport(item, activity, rqmtList1)} 
                style={[
                styles.reportButton2, {
                borderColor: ACCENT_COLOR, 
                borderWidth: 1.5,
                borderRadius: 1
                }]}>
                <Ionicons name="document" size={12} color={ACCENT_COLOR} style={[{padding: 3}]}/>
            </Pressable>
            {/* hard scout info */}
            <Text style={[styles.rosterCell, styles.nameCell]}>
                {item.scout.scout_first_name+" "+item.scout.scout_last_name}
            </Text>
            <Text style={[styles.rosterCell, styles.troopCell]}>
                {item.troop.troop_nmbr}</Text>
            <Text style={[styles.rosterCell, styles.typeCell, styles.categoryChangeCell]}>
                {item.troop.troop_type}</Text>

            {/* attendance boxes */}
            <Pressable style={[styles.rosterCell, styles.boxCell]}>
                <Checkbox
                    style={[styles.rosterCell]}
                    value={item.attendance.monday || false}
                    onValueChange={() => toggleNestedCheckbox(item.id, 'attendance', 'monday')}
                    color={item.attendance.monday ? ACCENT_COLOR : undefined}/>
            </Pressable>
            <Pressable style={[styles.rosterCell, styles.boxCell]}>
                <Checkbox
                    style={[styles.rosterCell]}
                    value={item.attendance.tuesday || false}
                    onValueChange={() => toggleNestedCheckbox(item.id, 'attendance', 'tuesday')}
                    color={item.attendance.tuesday ? ACCENT_COLOR : undefined}/>
            </Pressable>
            <Pressable style={[styles.rosterCell, styles.boxCell]}>
                <Checkbox
                    style={[styles.rosterCell]}
                    value={item.attendance.wednesday || false}
                    onValueChange={() => toggleNestedCheckbox(item.id, 'attendance', 'wednesday')}
                    color={item.attendance.wednesday ? ACCENT_COLOR : undefined}/>
            </Pressable>
            <Pressable style={[styles.rosterCell, styles.boxCell]}>
            <Checkbox
                    style={[styles.rosterCell]}
                    value={item.attendance.thursday || false}
                    onValueChange={() => toggleNestedCheckbox(item.id, 'attendance', 'thursday')}
                    color={item.attendance.thursday ? ACCENT_COLOR : undefined}/>
            </Pressable>
            <Pressable style={[styles.rosterCell, styles.boxCell, styles.categoryChangeCell]}>
                <Checkbox
                    style={[styles.rosterCell]}
                    value={item.attendance.friday || false}
                    onValueChange={() => toggleNestedCheckbox(item.id, 'attendance', 'friday')}
                    color={item.attendance.friday ? ACCENT_COLOR : undefined}/>
            </Pressable>

            {item.reqs?.map( (req) => (
                <View key={req.scout_badge_rqmt_id} style={[styles.rosterCell, styles.boxCell]}>
                    <Checkbox
                        style={[styles.rosterCell]}
                        value={req.completed || false}
                        onValueChange={() => toggleNestedCheckbox(item.id, 'reqs', req.scout_badge_rqmt_id)}
                        color={req.completed ? ACCENT_COLOR : undefined}/>
                </View>
            ))}

            <Pressable style={[styles.rosterCell, styles.completeCell, {borderLeftWidth:2, borderLeftColor: '#000'}]}>
            <Checkbox
                value={item.sBadge.completed || false}
                onValueChange={() => toggleNestedCheckbox(item.id, 'sBadge', 'completed')}
                color={item.sBadge.completed ? ACCENT_COLOR : undefined}/>
            </Pressable>

        </View>
    );

    const syncWithSupabase = async() => {
        try{
            setError("");
            setIsSyncing(true);

            // var newsAndUpdates: rosterUpdate[] = [...pendingChanges.created, ...pendingChanges.updated ]

            var attendance = pendingChanges.updated.map( (change) => {
                return change.state.attendance});

            var sBadges = pendingChanges.updated.map( (change) => {
                return change.state.sBadge});

            var nestedReqs = pendingChanges.updated.map( (change) => {
                return change.state.reqs});

            var mixedReqs: dbScout_badge_rqmt[] = [];
            nestedReqs.map( (list) => (
                list.map( (item) => (mixedReqs.push(item)))
            ));

            const [attendUpResp, sBadgesUpResp] = await Promise.all([
                supabase.from('attendance').upsert(attendance),
                supabase.from('scout_badge').upsert(sBadges)
            ]);

            const reqsUpResp = await supabase
                .from('scout_badge_rqmt')
                .upsert(mixedReqs);

            if( attendUpResp.error || sBadgesUpResp.error || reqsUpResp.error) {
                console.error(attendUpResp.error);
                console.error(sBadgesUpResp.error);
                console.error(reqsUpResp.error);
                throw error};

            attendance = [];
            sBadges =[];
            nestedReqs = [];
            mixedReqs = [];

            var attendance = pendingChanges.deleted.map( (change) => {
                return change.state.attendance});

            var sBadges = pendingChanges.deleted.map( (change) => {
                return change.state.sBadge});

            var nestedReqs = pendingChanges.deleted.map( (change) => {
                return change.state.reqs});

            nestedReqs.map( (list) => (
                list.map( (item) => (mixedReqs.push(item)))
            ));

            const [attendDelResp, sBadgesDelResp] = await Promise.all([

                supabase.from('attendance').delete()
                    .in('scout_id, activity_id', attendance.map(d => (d.scout_id, d.activity_id))),

                supabase.from('scout_badge').delete()
                    .in('scout_badge_id', sBadges.map(d => d.scout_badge_id))
            ]);
            const reqsDelResp = await supabase
                .from('scout_badge_rqmt')
                .delete()
                .in('scout_badge_rqmt_id', mixedReqs.map(d => d.scout_badge_rqmt_id));
            
            if( attendDelResp.error || sBadgesDelResp.error || reqsDelResp.error) {
                console.error(attendDelResp.error);
                console.error(sBadgesDelResp.error);
                console.error(reqsDelResp.error);
                throw error};
            

        }
        catch(err){
            console.error('Error syncing data:', error);
            setError('Failed to sync with supabase')
            pendingChanges.created.map(change => rollback(change));
            pendingChanges.updated.map(change => rollback(change));
            pendingChanges.deleted.map(change => rollback(change));
        }
        finally{
            setPendingchanges({ created: [], updated: [], deleted: [] });
            setIsSyncing(false);
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (pendingChanges.created.length > 0 ||
                pendingChanges.updated.length > 0 ||
                pendingChanges.deleted.length > 0) {
                    syncWithSupabase();
                }
            }, 5000); // Sync every 5 seconds
        return () => clearTimeout(timer);
    }, [pendingChanges]);

    useEffect(() => {
        fetchRosterData();
      }, [fetchRosterData]);

    return(
        <View>
            <View style={styles.syncRow}>
                            <View style={styles.syncingContainer}>
                                <Text>Synced: </Text>
                                {isSyncing?  (
                                    <ActivityIndicator size={20} color={ACCENT_COLOR} />
                                ) : (
                                    <Ionicons name="checkmark" size={20} color={ACCENT_COLOR}/>
                                )}
                            </View>
                            
                                <Pressable onPress={ () => makeAttendanceRoster(rosterData, activity, rqmtList1, rqmtList2)} 
                                    style={[styles.reportButton, {borderColor: ACCENT_COLOR}]}>
                                        <Ionicons name="document" size={20} color={ACCENT_COLOR} style={[{padding: 3}]}/>
                                        <Text>Make Report</Text>
                                </Pressable>
                            
                        </View>
            
            <ScrollView horizontal={true}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={ACCENT_COLOR} />
                    <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={48} color="#dc2626" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : (
                    <View style={styles.rosterContainer}>
                        <FlatList
                            data={rosterData?.filter( (row) => (row.badge_id === badge1ID))}
                            renderItem={renderRow}
                            keyExtractor={ (item) => item.id }
                            ListHeaderComponent={renderHeader(badge1ID, true)}/>
                        
                        { isMultibadge &&
                            <FlatList
                            data={rosterData?.filter( (row) => (row.badge_id === badge2ID))}
                            renderItem={renderRow}
                            keyExtractor={ (item) => item.id }
                            ListHeaderComponent={renderHeader(badge2ID, false)}/>}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};