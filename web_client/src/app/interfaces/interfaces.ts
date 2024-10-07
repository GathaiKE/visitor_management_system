import { Observable } from "rxjs"
import Decimal from 'decimal.js'

export interface Visitor{
    id: string
    phone_number: string
    first_name: string
    last_name: string
    id_number: string
    otp: string
    otp_expiry: string
    is_phone_verified: boolean
    is_checked_in: boolean
    image_url: string |null
    rating: string |null
    image: string |null
    blacklisted?:boolean
    created_at: string
    updated_at: string |null
    deleted_at: string |null
  }


  export interface Admin{
    id: string
    organization?: Organization
    building?: Building
    password: string
    last_login: string | null
    is_superuser: boolean
    id_number?:string
    address?:string
    username: string
    first_name: string
    last_name: string
    middle_name:string
    email: string
    is_assistant_superuser:boolean
    is_staff: boolean
    is_active: boolean
    date_joined: string
    is_admin: boolean
    is_visitor: boolean
    is_checked_in: boolean
    is_phone_verified: boolean
    otp: string
    otp_expiry: string
    phone_number: string
    groups: string[]
    user_permissions: string[]
}

export interface NewAdmin{
  first_name: string
  middle_name:string
  last_name:string
  username: string
  id_number?:string
  address?:string
  email: string
  organization?: string
  building?: string
  password: string
  phone_number: string
  is_superuser: boolean
  is_staff: boolean
  is_active: boolean
  is_assistant_super_admin?:boolean
  is_admin: boolean
}

export interface NewAdminFormData{
  firstName:string,
  lastName:string,
  username:string,
  email:string,
  phoneNumber:string,
  organization?:string,
  building?:Building,
  password:string
}

export interface Organization {
    id: string;
    organization_number?:string
    address?:string
    email?:string
    phone_number?:string
    organization_name: string;
    status?:boolean
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  }

  export interface NewOrganization{
    address:string
    email:string
    phone_number:string
    organization_name: string;
    status:boolean
  }
  
  
  export interface Building {
    id: string
    organization?: Organization
    building_name: string
    location:string
    floors:number
    status?:boolean
    created_at: string
    updated_at: string | null
    deleted_at: string | null
  }
  

  export interface NewBuilding {
    organization: string
    building_name: string
    location:string
    floors:number
    status:boolean
  }
  export interface Floor{
    id: string
    building: Building
    floor_number: string
    created_at: string
    updated_at: string | null
    deleted_at: string | null
  }
  export interface Office{
    id: string
    floor: Floor
    office_name: string
    created_at: string
    updated_at: string | null
    deleted_at: string | null
  }

  export interface NewOffice {
    floor: Floor
    office_name: string
  }
    
  export interface Visit{
    id: string
    visitor: Visitor
    building: Building
    floor:Floor
    office:Office
    checkin_time: string
    checkout_time: string | null
    is_checked_in: boolean
    created_at: string
    updated_at: string | null
    deleted_at: string | null
  }



  export interface VisitData{
    id: string
    phone_number: string
    first_name: string
    last_name: string
    id_number: string
    office_name:string
    floor_number:string
    building_name: string
    checkin_time: string
    checkout_time: string | null
    is_checked_in:boolean
    organization_name:string | undefined
  }

export interface AdminUpdate{
    first_name:string
    last_name: string
    username:string
    email:string
}

export interface Details{
  id: string,
  visitors$: Observable<VisitData[]>
}

export interface ContactForm {
  name:string
  email:string
  message:string
}

export interface Payment{
  id:string
  transaction_number:string
  receipt_number:string
  amount:Decimal
  payment_method:string
  client_name:string
  client_email:string
  organization:Organization
  organization_name:string
  organization_email:string
  created_at:string
}

export interface NewPayment {
  transaction_number:string
  receipt_number:string
  amount:Decimal
  payment_method:string
  client_name:string
  client_email:string
  organization:Organization
  organization_name:string
  organization_email:string
}

export interface PaymentMethod{
  id:number
  type:string
}

export interface Traffic { 
  hour: string
  visits: number
}