const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
let limit = Number(params.limit);
let offset = Number(params.offset);

function getJobs() {
  if (!limit) {
    limit = 10;
  }
  if (!offset) {
    offset = 0;
  }

  const url = `https://dev-api.resellticket.co.kr/api/v1/jobs/get-list?limit=${limit}&offset=${offset}`;
  const result = $.ajax({
    url: url,
    type: "GET",
    async: false,
    contentType: "application/json",
    success: function (result) {
      return result;
    },
  }).responseJSON;

  if (result.result != true) {
    return;
  }

  let recordTemplate = `
        <tr>
          <td>{{JOB_ID}}</td>
          <td>{{CREATED_AT}}</td>
          <td>{{UPDATAED_AT}}</td>
          <td>{{PROCESSOR_NAME}}</td>
          <td>{{JOB_NAME}}</td>
          <td>{{EXECUTE_TIME}}</td>
          <td>{{DATA}}</td>
          <td>{{IS_EXECUTED}}</td>
          <td>{{IS_DESTROYED}}</td>
          <td>{{LOGS}}</td>
        </tr>
  `;

  $("#table-body").html("");
  for (let job of result.data.data) {
    let record = recordTemplate;
    record = record.replace("{{JOB_ID}}", job.jobId);
    record = record.replace("{{CREATED_AT}}", job.createdAt);
    record = record.replace("{{UPDATAED_AT}}", job.updatedAt);
    record = record.replace("{{PROCESSOR_NAME}}", job.processorName);
    record = record.replace("{{JOB_NAME}}", job.jobName);
    record = record.replace("{{EXECUTE_TIME}}", job.executeTime);
    record = record.replace("{{DATA}}", JSON.stringify(job.data));
    record = record.replace("{{IS_EXECUTED}}", job.isExecuted);
    record = record.replace("{{IS_DESTROYED}}", job.isDestroyed);
    record = record.replace("{{LOGS}}", job.logs);
    $("#table-body").html($("#table-body").html() + record);
    console.log(job);
  }
}

getJobs();


// Pagination 
function prev() {
    if (offset === 0) {
        return;
    }

    offset -= limit;
    window.location.href = window.location.protocol + '//' + window.location.host + window.location.pathname + `?limit=${limit}&offset=${offset}`; 
}

function next() {
    offset += limit;
    window.location.href = window.location.protocol + '//' + window.location.host + window.location.pathname + `?limit=${limit}&offset=${offset}`; 
}

