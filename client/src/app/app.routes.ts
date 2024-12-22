import { Routes } from '@angular/router';
import { FlowComponent } from '../visual-flow/components/flow/flow.component';

export const routes: Routes = [
    {
        path:'',
        loadChildren:()=>import('../custom-dataset/custom-dataset.module').then(it=>it.CustomDatasetModule)
    },{
        path:'flow',
        component:FlowComponent
    }
];
