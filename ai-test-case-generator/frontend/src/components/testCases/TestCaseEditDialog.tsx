import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { TestCase, TestPriority, TestSeverity, UpdateTestCasePayload } from "../../types/testCase";

interface TestCaseEditDialogProps {
  open: boolean;
  testCase: TestCase | null;
  loading?: boolean;
  onClose: () => void;
  onSave: (payload: UpdateTestCasePayload) => Promise<void>;
}

export function TestCaseEditDialog({
  open,
  testCase,
  loading,
  onClose,
  onSave,
}: TestCaseEditDialogProps) {
  const { register, control, handleSubmit, reset, formState: { isSubmitting } } = useForm<UpdateTestCasePayload>({
    defaultValues: {
      title: "",
      priority: "MEDIUM",
      severity: "MODERATE",
      preconditions: "",
      expectedResult: "",
      postconditions: "",
      automationCandidate: false,
    },
  });

  useEffect(() => {
    if (testCase) {
      reset({
        title: testCase.title,
        category: testCase.category,
        priority: testCase.priority,
        severity: testCase.severity,
        preconditions: testCase.preconditions,
        expectedResult: testCase.expectedResult,
        postconditions: testCase.postconditions ?? "",
        automationCandidate: testCase.automationCandidate,
      });
    }
  }, [testCase, reset]);

  const submit = handleSubmit(async (values) => {
    await onSave(values);
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Test Case</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }} component="form" id="edit-test-case-form" onSubmit={submit}>
          <TextField label="Title" fullWidth {...register("title", { required: true })} />
          <TextField label="Category" fullWidth {...register("category")} />
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select {...field} label="Priority">
                  {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as TestPriority[]).map((p) => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
          <Controller
            name="severity"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select {...field} label="Severity">
                  {(["MINOR", "MODERATE", "MAJOR", "CRITICAL"] as TestSeverity[]).map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
          <TextField label="Preconditions" fullWidth multiline minRows={2} {...register("preconditions")} />
          <TextField label="Expected Result" fullWidth multiline minRows={2} {...register("expectedResult")} />
          <TextField label="Postconditions" fullWidth multiline minRows={2} {...register("postconditions")} />
          <Controller
            name="automationCandidate"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={Boolean(field.value)} onChange={field.onChange} />}
                label="Automation Candidate"
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          form="edit-test-case-form"
          variant="contained"
          disabled={isSubmitting || loading}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
