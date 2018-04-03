
package no.kdrs.grouse.controller;

import no.kdrs.grouse.model.Project;
import no.kdrs.grouse.model.ProjectFunctionality;
import no.kdrs.grouse.model.ProjectRequirement;
import no.kdrs.grouse.service.interfaces.IDocumentService;
import no.kdrs.grouse.service.interfaces.IProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static no.kdrs.grouse.utils.Constants.*;
import static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo;
import static org.springframework.hateoas.mvc.ControllerLinkBuilder.methodOn;

/**
 * Created by tsodring on 9/25/17.
 */
@RestController
@RequestMapping(value = SLASH + PROJECT)
public class ProjectController {

    private IDocumentService documentService;
    private IProjectService projectService;

    public ProjectController(IDocumentService documentService,
                             IProjectService projectService) {
        this.documentService = documentService;
        this.projectService = projectService;
    }

    @RequestMapping(value = "/{prosjektnummer}", method = RequestMethod.GET)
    public ResponseEntity<Project> getProject(
            @PathVariable("prosjektnummer") Long projectId) {

        Project project = projectService.findById(projectId);
        project.add(linkTo(methodOn(ProjectController.class).
                getProject(projectId)).withSelfRel());
        project.add(linkTo(methodOn(ProjectController.class).
                getFunctionalityForProject(projectId))
                .withRel(FUNCTIONALITY));
        return ResponseEntity.status(HttpStatus.OK)
                .body(project);
    }

    @RequestMapping(value = "/{prosjektnummer}/" + FUNCTIONALITY
            + "/{funksjonalitet}", method = RequestMethod.GET)
    public ResponseEntity<List<ProjectRequirement>>
    getRequirementsForFunctionality(
            @PathVariable("prosjektnummer") Long projectId,
            @PathVariable("funksjonalitet") String functionalityNumber) {

        List<ProjectRequirement> projectRequirements =
                projectService.findByProjectIdOrderByProjectName(
                        projectId, functionalityNumber);

        return ResponseEntity.status(HttpStatus.OK)
                .body(projectRequirements);
    }

    @RequestMapping(value = "/{prosjektnummer}/" + FUNCTIONALITY,
            method = RequestMethod.GET)
    public ResponseEntity<List<ProjectFunctionality>>
    getFunctionalityForProject(
            @PathVariable("prosjektnummer") Long projectId) {

        List<ProjectFunctionality> projectFunctionalities =
                projectService.findFunctionalityForProject(projectId);

        for (ProjectFunctionality projectFunctionality :
                projectFunctionalities) {

            // Add SELF REL to each projectRequirement
            for (ProjectRequirement projectRequirement :
                    projectFunctionality
                            .getReferenceProjectRequirement()) {

                projectRequirement.add(linkTo(methodOn(
                        ProjectRequirementController.class).
                        getRequirement(projectRequirement.
                                getProjectRequirementId())).withSelfRel());
            }

            // Add REL to retrieve all requirements
            projectFunctionality.add(linkTo(methodOn(
                    ProjectFunctionalityController.class).
                    getRequirements(projectFunctionality.
                            getProjectFunctionalityId())).
                    withRel(REQUIREMENT));
            projectFunctionality.add(linkTo(methodOn
                    (ProjectFunctionalityController.class).
                    getRequirements(projectFunctionality.
                            getProjectFunctionalityId())).withSelfRel());
        }
        return ResponseEntity.status(HttpStatus.OK)
                .body(projectFunctionalities);
    }

    @RequestMapping(method = RequestMethod.DELETE)
    public ResponseEntity<String> deleteProject(
            @PathVariable("prosjektnummer") Long projectId) {
        projectService.delete(projectId);
        return ResponseEntity.status(HttpStatus.OK)
                .body("Prosjekt med id " + projectId + "ble slettet");
    }
}
