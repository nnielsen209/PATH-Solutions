/**
 * RosterUI.tsx - UI for entering and viewing attendence and completion
 *
 * The primary interface for instructors to log records
 * 
 */
import React, { useCallback, useState } from "react";
import{
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    FlatList,
    useWindowDimensions,
    ScrollView,
    ListRenderItem,
    Pressable,
    ActivityIndicator
} from "react-native";
import { styles, ACCENT_COLOR } from "../../styles/ReportsStyles";
import { Checkbox } from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';

interface dbBadgeID{
    badge_id: string;
}

interface dbAttendence{
    scout_id: string;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;

}


interface rosterRow{
    id: string;
    name: string;
    troopNum: string;
    troopType: string;
    isheader: boolean;
    mAttend: boolean;
    tAttend: boolean;
    wAttend: boolean;
    thAttend: boolean;
    fAttend: boolean;
    reqs?: requirement[];
    badgeCompleted: boolean;
};

interface requirement{
    id: string;
    idnf: string;
    state: boolean;
}

interface dbActivity{
  id: string;
  name: string;
  periodID: string;
};


const testRows: rosterRow[] = [
    {id: 'test1',
    name: 'John Doe',
    troopNum: '000',
    troopType: 'B',
    isheader: false,
    mAttend: false,
    tAttend: false,
    wAttend: false,
    thAttend: false,
    fAttend: false,
    badgeCompleted: false,
    reqs: [
        {
            id: '123123',
            idnf: '1.',
            state: false
        },
        {
            id: '876587',
            idnf: '2.',
            state: false
        },
        {
            id: '9676',
            idnf: '3.',
            state: false
        },
    ]},
    {id: 'test2',
    name: 'james green',
    troopNum: '001',
    troopType: 'B',
    isheader: false,
    mAttend: false,
    tAttend: false,
    wAttend: false,
    thAttend: false,
    fAttend: false,
    badgeCompleted: false,
    reqs: [
        {
            id: '3384684684',
            idnf: '1.',
            state: false
        },
        {
            id: '54688435138',
            idnf: '2.',
            state: false
        },
        {
            id: '681384343843',
            idnf: '3.',
            state: false
        },
    ]},
    {id: 'test3',
    name: 'benson Jones',
    troopNum: '002',
    troopType: 'B',
    isheader: false,
    mAttend: false,
    tAttend: false,
    wAttend: false,
    thAttend: false,
    fAttend: false,
    badgeCompleted: false,
    reqs: [
        {
            id: '65168468',
            idnf: '1.',
            state: false
        },
        {
            id: '3168468653',
            idnf: '2.',
            state: false
        },
        {
            id: '3546846846',
            idnf: '3.',
            state: false
        },
    ]},
];

const reqslist = [
    {idnf: '1.'},
    {idnf: '2.'},
    {idnf: '3.'},
]


export const RosterUI = (activity: dbActivity) => {

    const [isLoading, setIsLoading] = useState(true);
    const [rosterData, setRosterData] = useState<rosterRow[]>(testRows);
    const [error, setError] = useState<string | null>(null);
    const [badges, setBadges] = useState<dbBadgeID[] | null>(null);
    const [isMultibadge, setMultibadge] = useState<boolean>(false);
    

    const fetchRosterData = useCallback(async () =>{

        try{
            setError(null);
            setIsLoading(true);

            // scoutBadgeResp, scoutBadgeRqmtResp, meritBadgeResp

            const [actBadgeResp, attendResp] = await Promise.all([
                supabase.from("activity_badge").select('badge_id').eq('activity_id', activity.id),
                supabase.from('attendence').select(`
                    scout_id,
                    monday,
                    tuesday,
                    wednesday,
                    thursday,
                    friday
                    `).eq('activity_id', activity.id),
                // from scoutbadge all that match the list of scouts from this activity and the badge id
                // from acout badge rqmt all that match the badge and scout
                // from merit badge the badge(s) from this activity
            ]);

            if( actBadgeResp.error) throw error;
            if( attendResp.error) throw error;

            const badges: dbBadgeID[] = actBadgeResp.data || [];
            const attendRecords: dbAttendence[] = attendResp.data || [];

            setBadges(badges);
            if (badges.length > 1) setMultibadge(true);

            const scouts = attendRecords.map( (scout) => (scout.scout_id));
            



        }
        catch{

        }
        finally{

        }
    }, []);

    const toggleCheckbox = (rowID: string, key: keyof rosterRow) => {
        setRosterData(
            rosterData.map( (row) => 
                row.id === rowID
                ? {...row, [key]: !row[key]}
                : row
            )
        );
    };

    const toggleNestedCheckbox = (rowID: string, reqID: string) => {
        setRosterData(
            rosterData.map( (row) => {
                if (row.id === rowID){
                   const updatedreqs = row.reqs?.map( (req) => 
                        req.id === reqID? {...req, state: !req.state} : req
                   );
                   return {...row, reqs: updatedreqs};
                }
                return row; 
            })
        );
    };

    const renderHeader = () => (
        <View style={styles.rosterLabelRow}>
            <Text style={[styles.rosterlabelCell, styles.nameCell]}>Name</Text>
            <Text style={[styles.rosterlabelCell, styles.troopCell]}>Troop</Text>
            <Text style={[styles.rosterlabelCell, styles.typeCell]}>B/C/G</Text>

            <Text style={[styles.rosterlabelCell, styles.boxCell]}>M</Text>
            <Text style={[styles.rosterlabelCell, styles.boxCell]}>T</Text>
            <Text style={[styles.rosterlabelCell, styles.boxCell]}>W</Text>
            <Text style={[styles.rosterlabelCell, styles.boxCell]}>Th</Text>
            <Text style={[styles.rosterlabelCell, styles.boxCell]}>F</Text>

            {reqslist?.map( (req) => (
                <Text style={[styles.rosterlabelCell, styles.boxCell]}>{req.idnf}</Text>
            ))}

            <Text style={[styles.rosterlabelCell, styles.completeCell]}>Complete</Text>
        </View>
    );

    const renderRow: ListRenderItem<rosterRow> = ({item}) => (
        <View style={styles.rosterRow}>
            <Text style={[styles.rosterCell, styles.nameCell]}>{item.name}</Text>
            <Text style={[styles.rosterCell, styles.troopCell]}>{item.troopNum}</Text>
            <Text style={[styles.rosterCell, styles.typeCell]}>{item.troopType}</Text>
            <Pressable style={[styles.rosterCell, styles.boxCell]}>
                <Checkbox
                    style={[styles.rosterCell]}
                    value={item.mAttend || false}
                    onValueChange={() => toggleCheckbox(item.id, 'mAttend')}
                    color={item.mAttend ? ACCENT_COLOR : undefined}/>
            </Pressable>
            <Pressable style={[styles.rosterCell, styles.boxCell]}>
                <Checkbox
                    style={[styles.rosterCell]}
                    value={item.tAttend || false}
                    onValueChange={() => toggleCheckbox(item.id, 'tAttend')}
                    color={item.tAttend ? ACCENT_COLOR : undefined}/>
            </Pressable>
            <Pressable style={[styles.rosterCell, styles.boxCell]}>
                <Checkbox
                    style={[styles.rosterCell]}
                    value={item.wAttend || false}
                    onValueChange={() => toggleCheckbox(item.id, 'wAttend')}
                    color={item.wAttend ? ACCENT_COLOR : undefined}/>
            </Pressable>
            <Pressable style={[styles.rosterCell, styles.boxCell]}>
            <Checkbox
                    style={[styles.rosterCell]}
                    value={item.thAttend || false}
                    onValueChange={() => toggleCheckbox(item.id, 'thAttend')}
                    color={item.thAttend ? ACCENT_COLOR : undefined}/>
            </Pressable>
            <Pressable style={[styles.rosterCell, styles.boxCell]}>
                <Checkbox
                    style={[styles.rosterCell]}
                    value={item.fAttend || false}
                    onValueChange={() => toggleCheckbox(item.id, 'fAttend')}
                    color={item.fAttend ? ACCENT_COLOR : undefined}/>
            </Pressable>

            {item.reqs?.map( (req) => (
                <View style={[styles.rosterCell, styles.boxCell]}>
                    <Checkbox
                        style={[styles.rosterCell]}
                        value={req.state || false}
                        onValueChange={() => toggleNestedCheckbox(item.id, req.id)}
                        color={req.state ? ACCENT_COLOR : undefined}/>
                </View>
            ))}

            <Pressable style={[styles.rosterCell, styles.completeCell]}>
            <Checkbox
                value={item.badgeCompleted || false}
                onValueChange={() => toggleCheckbox(item.id, 'badgeCompleted')}
                color={item.badgeCompleted ? ACCENT_COLOR : undefined}/>
            </Pressable>
        </View>
    );

    return(

        
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
                <FlatList
                    style={styles.rosterContainer}
                    data={rosterData}
                    renderItem={renderRow}
                    keyExtractor={ (item) => item.id }
                    ListHeaderComponent={renderHeader}/>
            )}
        </ScrollView>
    );
};