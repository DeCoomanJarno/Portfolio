import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ProjectService } from '../../Services/project-service';
import { ProjectModel } from '../../Models/project-model';
import { TestProjectComponent } from '../ProjectPages/test-project/test-project.component';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
})
export class ProjectDetailComponent implements OnInit {
  project: ProjectModel | undefined;
  customComponentExists: boolean = false;
  customComponentsMap: { [key: string]: any } = {
    '1': TestProjectComponent
  };

  // ViewChild to dynamically load components
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef }) container!: ViewContainerRef;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');

    if (projectId) {
      this.loadProjectData(projectId); // Load the project data

      if (this.customComponentExistsForProject(projectId)) {
        this.loadCustomComponent(projectId); // Load custom component if it exists
      } else {
        this.loadTemplateComponent(); // Otherwise, load the default project template
      }
    }
  }

  // Check if a custom component exists for this project
  customComponentExistsForProject(projectId: string): boolean {
    

    // Check if the ID corresponds to a custom component
    return !!this.customComponentsMap[projectId];
  }

  // Dynamically load custom component
  loadCustomComponent(projectId: string): void {
    const customComponent = this.customComponentsMap[projectId];

    if (customComponent) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(customComponent);
      this.container.clear();
      this.container.createComponent(componentFactory); // Dynamically create custom component
      this.customComponentExists = true; // Mark that custom component is loaded
    }
  }

  // Load the default project template component if no custom component exists
  loadTemplateComponent(): void {
    this.customComponentExists = false; // Fallback to template-based logic if no custom component exists
    // Template rendering is handled in the HTML
  }

  // Load project data from the service
  loadProjectData(projectId: string): void {
    this.projectService.getProjectById(projectId).subscribe((data) => {
      if (data) {
        this.project = data;
        this.titleService.setTitle(data.title); // Set dynamic page title
      }
    });
  }
}
