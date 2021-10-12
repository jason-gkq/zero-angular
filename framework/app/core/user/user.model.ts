import { Model } from '@core/model/model';
export class UserModel extends Model {
  userInfo: {
    address: string,
    birthday: Date,
    createdTime: number,
    faceImageUrl: string,
    gender: number,
    hometown: string,
    id: number,
    intro: string,
    nickName: string,
    placeId: number,
    realName: string,
    updatedTime: number,
    userId: number
  };
  oauthUser: {
    createdTime: number,
    extOpenid: number,
    faceImg: string,
    gender: string,
    id: number,
    isSubscribe: string,
    nickname: string,
    openid: string,
    provider: string,
    providerId: number,
    updatedTime: number,
    userId: number,
    userInfo: null
  };
  user: {
    createdTime: number,
    email: string,
    emailStatus: number,
    id: number,
    loginName: string,
    mobile: number,
    mobileStatus: number,
    passwd: string,
    registerIp: string,
    updatedTime: number,
    userStatus: number
  };
}
