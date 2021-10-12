import {Model} from '../model/model';

export class RoleModel extends Model {
  appCode: number;
  roleDesc: boolean;
  roleName: string;
  userId: number;
  roleId: string;
  groupType: number;
  groupId: number;
  groupName: string;
}
