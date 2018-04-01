package no.kdrs.grouse.service;

import no.kdrs.grouse.model.*;
import no.kdrs.grouse.persistence.*;
import no.kdrs.grouse.service.interfaces.IProjectService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.EntityNotFoundException;
import javax.persistence.Query;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Created by tsodring on 9/25/17.
 */
@Service
@Transactional
public class ProjectService
        implements IProjectService {

    private EntityManager entityManager;
    private IProjectRepository projectRepository;
    private IRequirementRepository requirementRepository;
    private IFunctionalityRepository functionalityRepository;
    private IProjectRequirementRepository projectRequirementRepository;
    private IProjectFunctionalityRepository projectFunctionalityRepository;

    public ProjectService(
            EntityManager entityManager,
            IProjectRepository projectRepository,
            IRequirementRepository requirementRepository,
            IFunctionalityRepository functionalityRepository,
            IProjectRequirementRepository projectRequirementRepository,
            IProjectFunctionalityRepository projectFunctionalityRepository) {
        this.entityManager = entityManager;
        this.projectRepository = projectRepository;
        this.requirementRepository = requirementRepository;
        this.functionalityRepository = functionalityRepository;
        this.projectRequirementRepository = projectRequirementRepository;
        this.projectFunctionalityRepository = projectFunctionalityRepository;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<ProjectRequirement> findByProjectIdOrderByProjectName(
            Long projectId, String functionalityNumber) {
        String queryString =
                "select p from ProjectRequirement as p where " +
                        "p.referenceProject.projectId = :projectId " +
                        "AND p.referenceFunctionality.functionalityNumber = " +
                        ":functionalityNumber";

        Query query = entityManager.createQuery(queryString);
        query.setParameter("projectId", projectId);
        query.setParameter("functionalityNumber", functionalityNumber);
        return query.getResultList();
    }

    /**
     * findFunctionalityForProject
     * <p>
     * Get a list of ProjectFunctionality for a give Project
     *
     * @param projectId Id of the project to retrieve ProjectFunctionality
     * @return list of ProjectFunctionality
     */
    @Override
    @SuppressWarnings("unchecked")
    public List<ProjectFunctionality> findFunctionalityForProject(
            Long projectId) {

        Project project = new Project();
        project.setProjectId(projectId);

        List<ProjectFunctionality> projectRequirements =
                projectFunctionalityRepository.
                        findByReferenceProjectAndShowMe(project, true);

        return projectRequirements;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<Project> findAll() {
        return (ArrayList) projectRepository.findAll();
    }

    @Override
    public Project findById(@NotNull Long id) {
        return getProjectOrThrow(id);
    }

    /**
     * Create a new project.
     * <p>
     * The following steps are performed:
     * 1. Retrieve User object from loggedin user and associate with project
     * 2. Copy all Requirement objects and create ProjectRequirement objects
     * 3. Copy all Functionality objects and create ProjectFunctionality objects
     * <p>
     * This is done as each project needs their own copy to work on.
     * Requirements are needed as within the project the used can change the
     * text, add or remove ProjectRequirements
     * ProjectFunctionality are needed to save state of the progress. For each
     * step that is processed a progress value is set. This is useful to be
     * able to reload the project but also eases the GUI side of things.
     * <p>
     * State is stored in the database, not the GUI
     *
     * @param project The project object to create
     * @return The persisted object after it was persisted with associated data
     */
    @Override
    @SuppressWarnings("unchecked")
    public Project createProject(Project project) {

        project.setCreatedDate(new Date());
        project.setChangedDate(new Date());
        // TODO: Replace this with logged in user when security is
        // in place
        GrouseUser user = new GrouseUser();
        user.setUsername("admin@kdrs.no");
        project.setReferenceUser(user);
        projectRepository.save(project);

        ArrayList<Functionality> functionalities =
                (ArrayList) functionalityRepository.findAll();
        for (Functionality functionality : functionalities) {
            ProjectFunctionality projectFunctionality =
                    new ProjectFunctionality();
            projectFunctionality.setTitle(
                    functionality.getTitle());
            projectFunctionality.setFunctionalityNumber(
                    functionality.getFunctionalityNumber());
            projectFunctionality.setConsequence(
                    functionality.getConsequence());
            projectFunctionality.setDescription(
                    functionality.getDescription());
            projectFunctionality.setExplanation(
                    functionality.getExplanation());
            projectFunctionality.setType(
                    functionality.getType());
            projectFunctionality.setShowMe(
                    functionality.getShowMe());
            projectFunctionality.setProcessed(false);
            projectFunctionality.setReferenceProject(project);
            projectFunctionalityRepository.save(projectFunctionality);
        }

        ArrayList<Requirement> requirements =
                (ArrayList) requirementRepository.findAll();
        for (Requirement requirement : requirements) {
            ProjectRequirement projectRequirement = new ProjectRequirement();
            projectRequirement.setReferenceProject(project);
            projectRequirement.setOrder(requirement.getOrder());
            projectRequirement.setPriority(requirement.getPriority());
            projectRequirement.setRequirementText(
                    requirement.getRequirementText());

            ProjectFunctionality projectFunctionality =
            projectFunctionalityRepository.findByFunctionalityNumber(
                    requirement.getFunctionality().getFunctionalityNumber()
            );

            projectRequirement.setReferenceFunctionality(
                    projectFunctionality);
            projectRequirementRepository.save(projectRequirement);
        }

        return project;
    }

    @Override
    public Project update(Long id, Project project)
            throws EntityNotFoundException {

        Project originalProject = getProjectOrThrow(id);
        // copy the values over
        originalProject.setFileName(project.getFileName());
        originalProject.setProjectName(project.getProjectName());

        // probably don't want to expose this one
        //originalProject.ListProjectOwner(project.getProjectOwner());
        return originalProject;
    }

    @Override
    public List<Project> findByReferenceUser(GrouseUser user) {
        return projectRepository.findByReferenceUser(user);
    }

    @Override
    public void delete(Long id) {
        projectRepository.deleteById(id);
    }

    /**
     * Internal helper method. Rather than having a find and try catch in
     * multiple methods, we have it here once. If you call this, be aware
     * that you will only ever get a valid Project back. If there is no valid
     * Project, a EntityNotFoundException exception is thrown
     *
     * @param id The systemId of the project object to retrieve
     * @return the project object
     */
    private Project getProjectOrThrow(@NotNull Long id)
            throws EntityNotFoundException {
        return projectRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "No Project exists with Id " + id));
    }
}
