const fs = require("fs");

const generateFeedbackBody = (testResults) =>
  testResults
    .map((testResult) => {
      return testResult["assertionResults"].map((item) => {
        const statusSymbol = item["status"] == "passed" ? "✓" : "✗";
        return `${statusSymbol} ${item["title"]}`;
      });
    })
    .flat()
    .join("\n\n");

const generateReportBody = (testResults) =>
  testResults
    .map((testResult) => {
      const source = "From `" + testResult["name"] + "`:\n\n";

      return (
        source + "```\n" + testResult["message"].substring(0, 2000) + "\n```"
      );
    })
    .join("\n\n");

const generateFeedbackAndReport = (runStatus, testResults) => {
  if (runStatus === "runFailed") {
    const feedback =
      "We encountered errors when we tried to run tests on your submission. This usually happens when there is a syntax error in your code.\n\nPlease make sure that you run your code before making another submission. If you have seen this message more than once, please reach out to Pupilfirst team for support.";

    const reportPrefix =
      "One or more test suites failed without test results. This usually happens when there is a syntax error in the submitted code. What follows are snippets from test results:";

    const reportBody = generateReportBody(testResults);

    const report = reportPrefix + "\n\n" + reportBody;

    return [feedback, report];
  } else if (runStatus === "oneOrMoreTestsFailed") {
    const feedbackPrefix =
      "Uh oh! It looks like you've missed some parts of the task. Here are the results of the tests that we ran. A tick (✓) indicates a successful test, and a cross (✗) indicates a failed test.";

    const feedbackBody = generateFeedbackBody(testResults);

    const feedbackSuffix =
      "Please make sure that you go through the assignment instructions. If you're having trouble with this assignment, please reach out to the Pupilfirst team on our Discord server.";

    const feedback =
      feedbackPrefix + "\n\n" + feedbackBody + "\n\n" + feedbackSuffix;

    const reportPrefix =
      "One or more tests failed. What follows are snippets from test results:";

    const reportBody = generateReportBody(testResults);

    const report = reportPrefix + "\n\n" + reportBody;

    return [feedback, report];
  } else if (runStatus === "testsPassed") {
    const feedbackPrefix =
      "Great! Your code worked just as expected. These are the tests we ran:";

    const feedbackBody = generateFeedbackBody(testResults);

    const feedbackSuffix = "See you in the next level!";

    const feedback =
      feedbackPrefix + "\n\n" + feedbackBody + "\n\n" + feedbackSuffix;

    return [feedback, "All tests passed."];
  } else {
    throw "Unexpected runStatus value " + runStatus;
  }
};

const writeReport = (data) => {
  console.log(data);

  fs.writeFileSync("./report.json", JSON.stringify(data));
};

const readFile = async (filePath) => {
  try {
    const data = await fs.promises.readFile(filePath, "utf8");
    return data;
  } catch (err) {
    console.log("File not found | Grading Skipped");
  }
};

const computeRunStatus = (results) => {
  if (results["numFailedTests"] == 0 && results["numFailedTestSuites"] > 0) {
    return "runFailed";
  } else if (results["numFailedTests"] > 0) {
    return "oneOrMoreTestsFailed";
  } else {
    return "testsPassed";
  }
};

readFile("results.json").then((data) => {
  if (data) {
    const results = JSON.parse(data);
    const runStatus = computeRunStatus(results);

    const [feedback, report] = generateFeedbackAndReport(
      runStatus,
      results["testResults"]
    );

    writeReport({
      version: 0,
      grade: runStatus == "testsPassed" ? "accept" : "reject",
      status: runStatus == "testsPassed" ? "success" : "failure",
      feedback: feedback,
      report: report,
    });
  } else {
    writeReport({
      version: 0,
      grade: "skip",
      status: "failure",
      feedback:
        "We are unable to test your submission - something about it was too different from what we were expecting. Please check the instructions for this task and try again. If you have seen this message more than once, please reach out to Pupilfirst team for support.",
      report:
        "Unable to generate report due to missing `results.json` file. Please contact a Pupilfirst team member and ask them the check VTA logs.",
    });
  }
});
