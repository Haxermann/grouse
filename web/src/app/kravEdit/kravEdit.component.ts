import {Component, Inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {UserData} from '../models/UserData.model';
// @ts-ignore
import {convertFromLegacy, REL_FUNCTIONALITY, REL_PROJECT} from '../common';
import {projectFunctionality} from '../models/projectFunctionality.model';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './kravEdit.component.html',
  styleUrls: [
    './kravEdit.component.css',
    '../common.css'
  ]
})

// tslint:disable-next-line:class-name
export class kravEditComponent implements OnInit {

  public title = 'Grouse';
  private sideBarOpen: boolean;
  private currentReq: projectFunctionality;

  private http: HttpClient;
  private router: Router;
  private userData: UserData;
  private projectLink: string;
  private mainData: projectFunctionality[];
  private newReqPriority: string;
  private selectedTab: number;

  private treeControl: NestedTreeControl<Requirment>;
  private dataSource: MatTreeNestedDataSource<Requirment>;
  private nav: Requirment[];
  private dialog: MatDialog;

  constructor(http: HttpClient, router: Router, dialog: MatDialog) {
    this.http = http;
    this.router = router;
    this.projectLink = '';
    this.sideBarOpen = false;
    this.dialog = dialog;
  }

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('UserData'));
    this.projectLink = this.userData.currentProject._links.funksjon.href;
    this.fetchMainData();

    this.treeControl = new NestedTreeControl<Requirment>(
      node => node.children
    );

    this.dataSource = new MatTreeNestedDataSource<Requirment>();
    this.dataSource.data = TREE_DATA;
  }

  fetchMainData() {
    this.http.get(this.projectLink, {
      headers: new HttpHeaders({
          Authorization: 'Bearer ' + this.userData.oauthClientSecret
        }
      )
    }).subscribe(result => {
      const newlyLoaded = (this.mainData === undefined);
      // @ts-ignore
      this.mainData = result;
      this.convertLegacyLinks();
      if (newlyLoaded) {
        this.currentReq = this.mainData[0].referenceChildProjectFunctionality[0];
        this.selectedTab = 0;
      } else {
        this.changeReq(this.currentReq.projectFunctionalityId);
      }
      console.log(this.mainData);
    }, error => {
      console.error(error);
    });
  }

  /*
  * This method sends the user to the main menu when called
  */
  goToMainMenu() {
    this.userData.nav = 'Menu';
    localStorage.setItem('UserData', JSON.stringify(this.userData));
    this.router.navigate(['/Menu']);
  }

  /*
  * This method converts the links subsection of elements sent from the server from the old Spring Boot Standard to the new format
  * This might not be required in newer version so this method might disapear later wich whould be a nice thing
  */
  convertLegacyLinks() {
    const NavData: Requirment[] = [];     // For the sidenav Tree every NavReq is fo this purpose aswell
    for (const prime of this.mainData) {
      const NavReqP = new Requirment();
      NavReqP.id = prime.projectFunctionalityId;
      NavReqP.name = prime.title;
      NavReqP.children = [];
      for (const secondary of prime.referenceChildProjectFunctionality) {
        const NavReqS = new Requirment();
        NavReqS.id = secondary.projectFunctionalityId;
        NavReqS.name = secondary.title;
        NavReqS.children = [];
        for (const tertiary of secondary.referenceChildProjectFunctionality) {
          // @ts-ignore
          tertiary._links = convertFromLegacy(tertiary.links);
          // @ts-ignore
          tertiary.links = null;

          // For the navigation tree
          const NavReqT = new Requirment();
          NavReqT.id = tertiary.projectFunctionalityId;
          NavReqT.name = tertiary.title;
          NavReqS.children.push(NavReqT);
        }
        NavReqP.children.push(NavReqS);
        for (const tertiary of secondary.referenceProjectRequirement) {
          // @ts-ignore
          tertiary._links = convertFromLegacy(tertiary.links);
          // @ts-ignore
          tertiary.links = null;

        }
        // @ts-ignore
        secondary._links = convertFromLegacy(secondary.links);
        // @ts-ignore
        secondary.links = null;
      }
      for (const secondary of prime.referenceProjectRequirement) {
        for (const tertiary of secondary.referenceChildProjectFunctionality) {
          // @ts-ignore
          tertiary._links = convertFromLegacy(tertiary.links);
          // @ts-ignore
          tertiary.links = null;
        }
        for (const tertiary of secondary.referenceProjectRequirement) {
          // @ts-ignore
          tertiary._links = convertFromLegacy(tertiary.links);
          // @ts-ignore
          tertiary.links = null;
        }
        // @ts-ignore
        secondary._links = convertFromLegacy(secondary.links);
        // @ts-ignore
        secondary.links = null;
      }
      // @ts-ignore
      prime._links = convertFromLegacy(prime.links);
      // @ts-ignore
      prime.links = null;
      NavData.push(NavReqP);
    }
    this.dataSource.data = NavData;
  }

  /*
  *This method both sends a call to the server to invalidate the current auth-token and sends the user to the login page
  * As this method is duplicated it will proabobly be moved later
  */
  logout() {
    localStorage.clear();
    this.http.get(this.userData.logoutAdress, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.userData.oauthClientSecret
      })
    }).subscribe(result => {
    }, error => {
      console.log(error);
    });
    this.router.navigate(['/']);
    location.reload();
  }

  /*
  * Takes the ID of a projectFunctionality and jumps to that functionality, used to select between different parts of the project
   */
  changeReq(id: number) {
    this.currentReq = this.findReq(id);
    this.newReqPriority = 'O';
    this.selectedTab = 0;
  }

  /**
   * findReq
   *
   * Finds the requirment inn main data with the specified id
   * @param id
   * Wich id to look for
   */
  findReq(id: number): projectFunctionality {
    // Primary level
    for (const primary of this.mainData) {
      if (primary.referenceChildProjectFunctionality.length > 0) {
        // Secondary level
        for (const secondary of primary.referenceChildProjectFunctionality) {
          if (secondary.referenceChildProjectFunctionality.length > 0) {
            // Tertiary level
            for (const tertiary of secondary.referenceChildProjectFunctionality) {
              if (tertiary.projectFunctionalityId === id) {
                return  tertiary;
              }
            }
          } else if (secondary.projectFunctionalityId === id) {
            return secondary;
          }
        }
      } else if (primary.projectFunctionalityId === id) {
        return  primary;
      }
    }
    return null;
  }

  /**
   * updateRequirementText
   *
   * handles a change in requirement text.
   */
  updateRequirementText(index: number) {
    const req = this.currentReq.referenceProjectRequirement[index];

    // @ts-ignore
    req.requirementText = document.getElementById('field-' + index).value;

    const patchString = '[{ "op": "replace", "path": "/requirementText", "value": "' +
      req.requirementText + '"}]';

    this.sendPatch(patchString, req._links.self.href);
  }

  /**
   * updateFunctionalityProcessed
   *
   * handles a change in requirement text.
   */
  updateFunctionalityProcessed() {
    this.currentReq.processed = !this.currentReq.processed;

    const patchString = '[{ "op": "replace", "path": "/processed", "value": "' +
      this.currentReq.processed + '"}]';

    this.sendPatch(patchString, this.currentReq._links.self.href);
  }

  /**
   * updateRequirementPriority
   *
   * handles a change in requirement priority.
   */
  updateRequirementPriority(index: number, priority: string) {
    const patchString = '[{ "op": "replace", "path": "/priority", "value": "' +
      priority + '"}]';

    this.sendPatch(patchString, this.currentReq.referenceProjectRequirement[index]._links.self.href);
  }
  /**
   * sendPatch
   *
   * Sends patches to the server, used by all update functions
   *
   * @param patchString
   * Inputted patchstring to send
   */
  sendPatch(patchString: string, url: string) {
    this.http.patch(url, JSON.parse(patchString), {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.userData.oauthClientSecret
      })
    }).subscribe(result => {
      console.log(result);
    }, error => {
      console.error(error);
    });
  }

  addRequirment() {
    const textfield = document.getElementById('NyttKrav');

    this.http.post(
      this.currentReq._links.self.href,
      {
        // @ts-ignore
        requirementText: textfield.value,
        priority: this.newReqPriority
      }, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.userData.oauthClientSecret
      })
    }).subscribe(result => {
      // @ts-ignore
      textfield.value = null;
      this.fetchMainData();
    }, error => {
      console.error(error);
    });
  }

  removeRequirment(index: number) {
    const dialogref = this.dialog.open(DeleteRequirmentDialog, {
      width: '300px'
    });

    dialogref.afterClosed().subscribe(result => {
      if (result) {
        this.http.delete(
          this.currentReq.referenceProjectRequirement[index]._links.self.href,
          {
            headers: new HttpHeaders({
              Authorization: 'Bearer ' + this.userData.oauthClientSecret
            })
          }).subscribe(
          // tslint:disable-next-line:no-shadowed-variable
            result => {
              this.fetchMainData();
            }, error => console.error(error));
      }
    });
  }

  newReqPriorityChange(priority: string) {
    this.newReqPriority = priority;
  }

  /**
   * nextReq
   *
   * Switches to the next rquirment
   */
  nextReq() {
    let switchto: projectFunctionality = null;
    let id = this.currentReq.projectFunctionalityId;
    id++;
    while (switchto === null) {
      switchto = this.findReq(id);
      id++;
    }
    this.currentReq = switchto;
    this.newReqPriority = 'O';
    this.selectedTab = 0;
  }

  /**
   * previousReq
   *
   * Switches to the previous rquirment
   */
  previousReq() {
    let switchto: projectFunctionality = null;
    let id = this.currentReq.projectFunctionalityId;
    id--;
    while (switchto === null) {
      // This if-statment stops the function from going into a endless-loop
      if (id < this.mainData[0].projectFunctionalityId) {
        return;
      }
      switchto = this.findReq(id);
      id--;
    }
    this.currentReq = switchto;
    this.newReqPriority = 'O';
    this.selectedTab = 0;
  }

  /**
   * findParentReq (Currently unused)
   *
   * finds a parent of the given child, returns null if none
   *
   * @param child of wich the parent should be found
   */
  findParentReq(child: projectFunctionality): projectFunctionality {
    // Primary level
    for (const primary of this.mainData) {
      if (primary.referenceChildProjectFunctionality.length > 0) {
        // Secondary level
        for (const secondary of primary.referenceChildProjectFunctionality) {
          if (secondary.referenceChildProjectFunctionality.length > 0) {
            // Tertiary level
            for (const tertiary of secondary.referenceChildProjectFunctionality) {
              if (tertiary.projectFunctionalityId === child.projectFunctionalityId) {
                return  secondary;
              }
            }
          } else if (secondary.projectFunctionalityId === child.projectFunctionalityId) {
            return primary;
          }
        }
      } else if (primary.projectFunctionalityId === child.projectFunctionalityId) {
        return  null;
      }
    }
  }

  hasChild = (_: number, node: Requirment) => !!node.children && node.children.length > 0;

  enterUserEdit() {
    this.userData.nav = 'userEdit';
    localStorage.setItem('UserData', JSON.stringify(this.userData));
    this.router.navigate(['/userEdit']);
  }

}

// Needed for tree structure
export class Requirment {
  name: string;
  id: number;
  children?: Requirment[];
}

const TREE_DATA: Requirment[] = [
  {
    name: 'Generelle krav',
    id: 0,
    children: [
      {name: '1.1 Krav om pølser', id: 0},
      {name: '1.2 Krav i henhold til nasjonale lover for saltmengde i kjøttprodukter', id: 0},
      {name: '1.3 Krav i forhold til utnyttelse av lovhull for å ungå krav 1.2', id: 0}
    ]
  },
  {
    name: 'Avanserte krav',
    id: 0,
    children: [
      {
        name: '1',
        id: 0,
        children: [
          { name: '1.1 Krav i forhold til salting', id: 0},
          { name: '1.2 Krav om fri på mandager', id: 0},
          { id: 0, name: '1.3 Krav om sene kvelder'}
        ]
      },
      {
        name: '2',
        id: 0,
        children: [
          { name: '2.1 Krav om bruk av toaletter', id: 0},
          { name: '2.2 Krav om kråker og andre irriterende skapninger', id: 0},
          { name: '2.3 Krav ved valg av ny Dungeon Master for kontorets søndagskvelder', id: 0}
        ]
      }
    ]
  }
];
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'DeleteRequirment.Dialog',
  templateUrl: '../Modals/RemoveReq.Dialog.html'
})
// tslint:disable-next-line:component-class-suffix
export class DeleteRequirmentDialog {
  constructor(public dialogRef: MatDialogRef<DeleteRequirmentDialog>, @Inject(MAT_DIALOG_DATA) public data: boolean) {
    this.data = true;
  }

  onNoClick() {
    this.dialogRef.close();
  }
}

