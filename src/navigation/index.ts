/**
 * index.ts - Navigation Exports
 *
 * Re-exports all navigators so the rest of the app can import from one place
 * (e.g. import { AdminNavigator } from '../navigation'). App.tsx uses these
 * to show the right navigator based on login and role.
 */

export { AuthNavigator } from './AuthNavigator';
export { AdminNavigator } from './AdminNavigator';
export { CounselorNavigator } from './CounselorNavigator';
export { AreaDirectorNavigator } from './AreaDirectorNavigator';
