// Scripted Forms -- Making GUIs easy for everyone on your team.
// Copyright (C) 2017 Simon Biggs

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version (the "AGPL-3.0+").

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License and the additional terms for more
// details.

// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

// ADDITIONAL TERMS are also included as allowed by Section 7 of the GNU
// Affrero General Public License. These aditional terms are Sections 1, 5,
// 6, 7, 8, and 9 from the Apache License, Version 2.0 (the "Apache-2.0")
// where all references to the definition "License" are instead defined to
// mean the AGPL-3.0+.

// You should have received a copy of the Apache-2.0 along with this
// program. If not, see <http://www.apache.org/licenses/LICENSE-2.0>.

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { IFormComponent } from '../form-builder-module/create-form-component-factory';
import { FormBuilderComponent } from '../form-builder-module/form-builder.component';

import { FormStatus } from '../types/form-status';

export interface FormStore {
  [sessionId: string]: {
    template: BehaviorSubject<string>;
    component: IFormComponent;
  };
}

@Injectable()
export class FormService {
  currentFormSessionId: string;
  formStore: FormStore = {};
  formBuilderComponent: FormBuilderComponent;
  initialising: FormStatus = 'initialising';
  formStatus: BehaviorSubject<FormStatus> = new BehaviorSubject(this.initialising);

  formInitialisation(sessionId: string) {
    this.formStatus.next('initialising');
    this.currentFormSessionId = sessionId;
    if (!(sessionId in this.formStore)) {
      this.formStore[sessionId] = {
        template: new BehaviorSubject(null),
        component: null
      };

      this.formStore[sessionId].template.subscribe(template => {
        if (template !== null) {
          this.formBuilderComponent.buildForm(sessionId, template).then(component => {
            this.formStore[sessionId].component = component;
            component.formReady.promise.then(() => {
              this.formStatus.next('ready');
            });
          });
        }
      });
    }
  }

  restartFormKernel() {
    this.formStatus.next('restarting');
    const formReadyPromise = this.formStore[this.currentFormSessionId].component.restartFormKernel();
    formReadyPromise.then(() => {
      this.formStatus.next('ready');
    });
    return formReadyPromise;
  }

  setTemplate(template: string, sessionId: string) {
    this.formStore[sessionId].template.next(template);
  }

  getTemplate(sessionId: string) {
    return this.formStore[sessionId].template.getValue();
  }
}
