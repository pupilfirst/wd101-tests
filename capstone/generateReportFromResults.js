let fs = require("fs");

let generateFeedback = (passed, results) => {
  const testResults = Object.keys(results)
    .map((key) => {
      let status = results[key];
      let statusSymbol = status == "passed" ? "✓" : "✗";
      return `${statusSymbol} ${key}`;
    })
    .join("\n\n");

  const prefix = passed
    ? "Good work! It looks like you've built your webpage according to our specifications. These are the tests we ran:"
    : "Uh oh! It looks like you've missed some parts of the assignment. Here are the results of the tests that we ran. A tick (✓) indicates a successful test, and a cross (✗) indicates a failed test.";

  const suffix = passed
    ? "_Congratulations on completing the capstone assignment! See you in the next course._"
    : "Please make sure that you go through the assignment instructions; make sure that your webpage contains a `table` element and that the `input` elements in the form have the correct `id` values. Our automated tests use these markers to interact with your application.\n\nIf you're having trouble with this assignment, carefully review your code for errors and refer to the course materials and provided guidelines.";

  const feedback = prefix + "\n\n" + testResults + "\n\n" + suffix;

  return feedback;
};

const writeReport = (data) => {
  console.log(data);
  let reportFile = "./report.json";
  fs.writeFileSync(reportFile, JSON.stringify(data));
};

const readFile = async (filePath) => {
  try {
    const data = await fs.promises.readFile(filePath, "utf8");
    return data;
  } catch (err) {
    console.log("File not found | Grading Skipped");
  }
};

readFile("results.json").then((data) => {
  if (data) {
    let results = JSON.parse(data);
    const passed = results["totals"]["failed"] == 0;
    let feedback = generateFeedback(passed, results[Object.keys(results)[0]]);
    writeReport({
      version: 0,
      grade: passed ? "accept" : "reject",
      status: passed ? "success" : "failure",
      feedback: feedback,
      report: feedback,
    });
  } else {
    writeReport({
      version: 0,
      grade: "skip",
      status: "failure",
      feedback:
        "We are unable to test your submission - something about it was too different from what we were expecting. Please check the instructions for this task and try again. If you have seen this message more than once, carefully review your code for errors and refer to the course materials and provided guidelines.",
      report: "Unable to generate report due to missing results.json.",
    });
  }
});
