class DemoRunner:
    def run_workflow(self, workflow_name: str):
        print(f"Project 2: Orchestrating clinical workflow - {workflow_name}...")
        return True

if __name__ == "__main__":
    runner = DemoRunner()
    runner.run_workflow("Heart_Failure_Admission")
