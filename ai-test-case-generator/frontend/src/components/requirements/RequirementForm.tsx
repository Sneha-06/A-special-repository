import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import type { ProjectSummary, Requirement, RequirementFormValues, RequirementPriority } from "../../types/requirement";

const PRIORITIES: RequirementPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const DEFAULT_VALUES: RequirementFormValues = {
  projectId: "",
  title: "",
  description: "",
  userStory: "",
  applicationModule: "",
  priority: "MEDIUM",
  acceptanceCriteria: "",
  additionalContext: "",
};

interface RequirementFormProps {
  projects: ProjectSummary[];
  initialValues?: Requirement;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (values: RequirementFormValues) => Promise<void>;
  onCancel?: () => void;
}

function toFormValues(requirement?: Requirement): RequirementFormValues {
  if (!requirement) return DEFAULT_VALUES;
  return {
    projectId: requirement.projectId,
    title: requirement.title,
    description: requirement.description,
    userStory: requirement.userStory ?? "",
    applicationModule: requirement.applicationModule ?? "",
    priority: requirement.priority,
    acceptanceCriteria: requirement.acceptanceCriteriaText ?? "",
    additionalContext: requirement.additionalContext ?? "",
  };
}

export function RequirementForm({
  projects,
  initialValues,
  loading,
  submitLabel = "Save Requirement",
  onSubmit,
  onCancel,
}: RequirementFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequirementFormValues>({
    defaultValues: toFormValues(initialValues),
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5}>
        <Controller
          name="projectId"
          control={control}
          rules={{ required: "Project is required" }}
          render={({ field }) => (
            <FormControl fullWidth error={Boolean(errors.projectId)}>
              <InputLabel id="project-label">Project</InputLabel>
              <Select {...field} labelId="project-label" label="Project">
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />

        <TextField
          label="Requirement Title"
          placeholder="e.g. Password Reset"
          fullWidth
          {...register("title", { required: "Title is required" })}
          error={Boolean(errors.title)}
          helperText={errors.title?.message}
        />

        <TextField
          label="Description"
          placeholder="Users should be able to reset their password using their registered email address."
          fullWidth
          multiline
          minRows={3}
          {...register("description", { required: "Description is required" })}
          error={Boolean(errors.description)}
          helperText={errors.description?.message}
        />

        <TextField
          label="User Story"
          placeholder="As a user, I want to reset my password so that I can regain access to my account."
          fullWidth
          multiline
          minRows={2}
          {...register("userStory")}
        />

        <TextField
          label="Application / Module"
          placeholder="e.g. Authentication Service"
          fullWidth
          {...register("applicationModule")}
        />

        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select {...field} labelId="priority-label" label="Priority">
                {PRIORITIES.map((priority) => (
                  <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />

        <TextField
          label="Acceptance Criteria"
          placeholder="Given a registered user, when they request a password reset, then an email with a secure link is sent within 2 minutes."
          fullWidth
          multiline
          minRows={3}
          {...register("acceptanceCriteria")}
        />

        <TextField
          label="Additional Context"
          placeholder="Security policies, compliance notes, integration constraints..."
          fullWidth
          multiline
          minRows={2}
          {...register("additionalContext")}
        />

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          {onCancel ? (
            <Button onClick={onCancel} disabled={isSubmitting || loading}>Cancel</Button>
          ) : null}
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || loading || projects.length === 0}
          >
            {isSubmitting || loading ? "Saving..." : submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
