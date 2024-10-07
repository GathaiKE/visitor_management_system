import { Routes } from '@angular/router';

export const routes: Routes = [
    {path:'',loadComponent:()=> import('./components/landing/landing.component').then(c=>c.LandingComponent) },
    {path:'login', loadComponent:()=> import('./components/auth/login/login.component').then(c=>c.LoginComponent)},
    {path:'buildings',loadComponent:()=> import('./components/dashboard/buildings/buildings.component').then(c=>c.BuildingsComponent),
        children:[
            {path:'all', loadComponent:()=>import('../app/components/dashboard/buildings/all/all.component').then(component=>component.AllComponent)},
            {path:'active', loadComponent:()=>import('../app/components/dashboard/buildings/active/active.component').then(component=>component.ActiveComponent)},
            {path:'inactive', loadComponent:()=>import('../app/components/dashboard/buildings/inactive/inactive.component').then(component=>component.InactiveComponent)},
        ]
    },
    {
        path:'organizations', loadComponent:()=> import('./components/dashboard/organizations/organizations.component').then(c=>c.OrganizationsComponent),
        children:[
            {path:'all', loadComponent:()=>import('../app/components/dashboard/organizations/all/all.component').then(component=>component.AllComponent)},
            {path:'active', loadComponent:()=>import('../app/components/dashboard/organizations/active/active.component').then(component=>component.ActiveComponent)},
            {path:'inactive', loadComponent:()=>import('../app/components/dashboard/organizations/inactive/inactive.component').then(component=>component.InactiveComponent)}
        ]
    },
    {path:'floors',  loadComponent:()=> import('./components/dashboard/floors/floors.component').then(c=>c.FloorsComponent)},
    {path:'building-detail/:id',  loadComponent:()=> import('./components/dashboard/buildings/details/details.component').then(c=>c.DetailsComponent)},
    {
        path:'visitors',loadComponent:()=> import('./components/dashboard/visitors/visitors.component').then(c=>c.VisitorsComponent),
        children:[
            {path:'all', loadComponent:()=>import('../app/components/dashboard/visitors/all/all.component').then(component=>component.AllComponent)},
            {path:'active', loadComponent:()=>import('../app/components/dashboard/visitors/active/active.component').then(component=>component.ActiveComponent)},
            {path:'blacklisted', loadComponent:()=>import('../app/components/dashboard/visitors/inactive/inactive.component').then(component=>component.InactiveComponent)},
        ]
    },
    {path:'visits', loadComponent:()=> import('./components/dashboard/visits/visits.component').then(c=>c.VisitsComponent)},

    
    {
        path:'admins', loadComponent:()=>import('../app/components/dashboard/admins/admins.component').then(c=>c.AdminsComponent),
        children:[
            {
                path:'assistant', loadComponent:()=>import('../app/components/dashboard/admins/super-admins/super-admins.component').then(c=>c.SuperAdminsComponent),
                children:[
                    {path:'', loadComponent:()=>import('../app/components/dashboard/admins/super-admins/all/all.component').then(c=>c.AllComponent)},
                    {path:'all', loadComponent:()=>import('../app/components/dashboard/admins/super-admins/all/all.component').then(c=>c.AllComponent)},
                    {path:'active', loadComponent:()=>import('../app/components/dashboard/admins/super-admins/active/active.component').then(c=>c.ActiveComponent)},
                    {path:'inactive', loadComponent:()=>import('../app/components/dashboard/admins/super-admins/inactive/inactive.component').then(c=>c.InactiveComponent)}
                ]
            },
            {
                path:'organization', loadComponent:()=>import('../app/components/dashboard/admins/organization-admins/organization-admins.component').then(c=>c.OrganizationAdminsComponent),
                children:[
                    {path:'', loadComponent:()=>import('../app/components/dashboard/admins/organization-admins/all/all.component').then(c=>c.AllComponent)},
                    {path:'all', loadComponent:()=>import('../app/components/dashboard/admins/organization-admins/all/all.component').then(c=>c.AllComponent)},
                    {path:'active', loadComponent:()=>import('../app/components/dashboard/admins/organization-admins/active/active.component').then(c=>c.ActiveComponent)},
                    {path:'inactive', loadComponent:()=>import('../app/components/dashboard/admins/organization-admins/inactive/inactive.component').then(c=>c.InactiveComponent)}
                ]
            },
            {
                path:'building', loadComponent:()=>import('../app/components/dashboard/admins/building-admins/building-admins.component').then(c=>c.BuildingAdminsComponent),
                children:[
                    {path:'', loadComponent:()=>import('../app/components/dashboard/admins/building-admins/all/all.component').then(c=>c.AllComponent)},
                    {path:'all', loadComponent:()=>import('../app/components/dashboard/admins/building-admins/all/all.component').then(c=>c.AllComponent)},
                    {path:'active', loadComponent:()=>import('../app/components/dashboard/admins/building-admins/active/active.component').then(c=>c.ActiveComponent)},
                    {path:'inactive', loadComponent:()=>import('../app/components/dashboard/admins/building-admins/inactive/inactive.component').then(c=>c.InactiveComponent)}
                ]
            }
        ]
    },
    {
        path:'detail/:id', loadComponent:()=>import('../app/components/dashboard/admin-detail/admin-detail.component').then(c=>c.AdminDetailComponent)
    },

    {
        path:'payments', loadComponent:()=>import('../app/components/dashboard/payments/payments.component').then(c=>c.PaymentsComponent)
    },
    {
        path:'profile', loadComponent:()=>import('../app/components/dashboard/profile/profile.component').then(c=>c.ProfileComponent)
    },
    {
        path:'organization-detail/:id', loadComponent:()=>import('../app/components/dashboard/organizations/details/details.component').then(c=>c.DetailsComponent)
    },
    
];
