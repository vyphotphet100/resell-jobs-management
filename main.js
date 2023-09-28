const baseUrl = `https://dev-api.resellticket.co.kr/api/v1`;
// const baseUrl = `http://localhost:3000/api/v1`;
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
let limit = Number(params.limit);
let offset = Number(params.offset);
let processorName = params.processorName;
let isExecuted = params.isExecuted;
let isDestroyed = params.isDestroyed;
let keyword = params.keyword;

initState();
getJobs();

function initState() {
  if (processorName) {
    $("#processorNameDropdown").text(processorName);
  }

  if (isExecuted) {
    $("#isExecuteDropdown").text(isExecuted);
  }

  if (isDestroyed) {
    $("#isDestroyedDropdown").text(isDestroyed);
  }

  if (keyword) {
    $("#keyword").val(keyword);
  }
}

function getJobs() {
  if (!limit) {
    limit = 10;
  }
  if (!offset) {
    offset = 0;
  }

  // const url = `${baseUrl}/jobs/get-list?limit=${limit}&offset=${offset}`;
  const url = new URL(`${baseUrl}/jobs/get-list`);
  url.searchParams.append("limit", limit);
  url.searchParams.append("offset", offset);
  if (processorName) {
    url.searchParams.append("processorName", processorName);
  }

  if (isExecuted) {
    url.searchParams.append("isExecuted", isExecuted);
  }

  if (isDestroyed) {
    url.searchParams.append("isDestroyed", isDestroyed);
  }

  if (keyword && keyword !== "") {
    url.searchParams.append("keyword", keyword);
  }

  const result = $.ajax({
    url: url.href,
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
          <td>
            <button type="button" class="btn btn-primary" onclick="executeJob('{{PROCESSOR_NAME}}', '{{JOB_ID}}')" {{IS_EXECUTE_BUTTON_SHOWN}}>Execute</button> 
            <button type="button" class="btn btn-info" onclick="reExecuteJob('{{PROCESSOR_NAME}}', '{{JOB_ID}}')" {{IS_RE-EXECUTE_BUTTON_SHOWN}}>Re-execute</button>
            <button type="button" class="btn btn-warning" onclick="destroyJob('{{PROCESSOR_NAME}}', '{{JOB_ID}}')" {{IS_DESTROY_BUTTON_SHOWN}}>Destroy</button> 
            <button type="button" class="btn btn-danger" onclick="removeJob('{{PROCESSOR_NAME}}', '{{JOB_ID}}')">Remove</button>
            
          </td>
        </tr>
  `;

  $("#table-body").html("");
  for (let job of result.data.data) {
    let record = recordTemplate;
    record = replaceValueToString("JOB_ID", job.jobId, record);
    record = replaceValueToString("CREATED_AT", job.createdAt, record);
    record = replaceValueToString("UPDATAED_AT", job.updatedAt, record);
    record = replaceValueToString("PROCESSOR_NAME", job.processorName, record);
    record = replaceValueToString("JOB_NAME", job.jobName, record);
    record = replaceValueToString("EXECUTE_TIME", job.executeTime, record);
    record = replaceValueToString("DATA", JSON.stringify(job.data), record);
    record = replaceValueToString("IS_EXECUTED", job.isExecuted, record);
    record = replaceValueToString("IS_DESTROYED", job.isDestroyed, record);
    record = replaceValueToString("LOGS", job.logs ?? "Success!", record);

    if (new Date(job.executeTime) > new Date()) {
      record = replaceValueToString(
        "IS_RE-EXECUTE_BUTTON_SHOWN",
        'style="display:none"',
        record
      );
      record = replaceValueToString("IS_EXECUTE_BUTTON_SHOWN", "", record);

      if (!job.isDestroyed) {
        record = replaceValueToString("IS_DESTROY_BUTTON_SHOWN", "", record);
      } else {
        record = replaceValueToString(
          "IS_DESTROY_BUTTON_SHOWN",
          'style="display:none"',
          record
        );
      }
    } else {
      record = replaceValueToString("IS_RE-EXECUTE_BUTTON_SHOWN", "", record);
      record = replaceValueToString(
        "IS_EXECUTE_BUTTON_SHOWN",
        'style="display:none"',
        record
      );
      record = replaceValueToString(
        "IS_DESTROY_BUTTON_SHOWN",
        'style="display:none"',
        record
      );
    }

    $("#table-body").html($("#table-body").html() + record);
  }
}

function replaceValueToString(name, value, content) {
  while (content.indexOf(`{{${name}}}`) != -1) {
    content = content.replace(`{{${name}}}`, value);
  }

  return content;
}

// Pagination
function prev() {
  if (offset === 0) {
    return;
  }

  const currentURL = window.location.href;
  const url = new URL(currentURL);
  offset -= limit;

  url.searchParams.delete("offset");
  url.searchParams.append("offset", offset);

  window.location.href = url.href;
}

function next() {
  const currentURL = window.location.href;
  const url = new URL(currentURL);
  offset += limit;

  url.searchParams.delete("offset");
  url.searchParams.append("offset", offset);

  window.location.href = url.href;
}

// Action functions
function reExecuteJob(processorName, jobId) {
  const url = `${baseUrl}/jobs/execute/${processorName}/${jobId}?reExecute=true`;

  const result = $.ajax({
    url: url,
    type: "POST",
    async: false,
    contentType: "application/json",
    success: function (result) {
      return result;
    },
  }).responseJSON;

  if (result.result != true) {
    alert("Something went wrong!");
    return;
  }

  alert("Success!");
  window.location.reload();
}

function executeJob(processorName, jobId) {
  const url = `${baseUrl}/jobs/execute/${processorName}/${jobId}`;

  const result = $.ajax({
    url: url,
    type: "POST",
    async: false,
    contentType: "application/json",
    success: function (result) {
      return result;
    },
  }).responseJSON;

  if (result.result != true) {
    alert("Something went wrong!");
    return;
  }

  alert("Success!");
  window.location.reload();
}

function removeJob(processorName, jobId) {
  const url = `${baseUrl}/jobs/delete/${processorName}/${jobId}`;

  const result = $.ajax({
    url: url,
    type: "DELETE",
    async: false,
    contentType: "application/json",
    success: function (result) {
      return result;
    },
  }).responseJSON;

  if (result.result != true) {
    alert("Something went wrong!");
    return;
  }

  alert("Success!");
  window.location.reload();
}

function destroyJob(processorName, jobId) {
  const url = `${baseUrl}/jobs/destroy/${processorName}/${jobId}`;

  const result = $.ajax({
    url: url,
    type: "POST",
    async: false,
    contentType: "application/json",
    success: function (result) {
      return result;
    },
  }).responseJSON;

  if (result.result != true) {
    alert("Something went wrong!");
    return;
  }

  alert("Success!");
  window.location.reload();
}

function syncJobs() {
  const url = `${baseUrl}/jobs/sync-job`;

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
    alert("Something went wrong!");
    return;
  }

  alert("Success!");
  window.location.reload();
}

function filterByProcessName(processorName) {
  const currentURL = window.location.href;
  const url = new URL(currentURL);

  if (!processorName) {
    url.searchParams.delete("processorName");
    window.location.href = url.href;
    return;
  }

  url.searchParams.delete("processorName");
  url.searchParams.append("processorName", processorName);

  window.location.href = url.href;
}

function filterByIsExecuted(inputIsExecuted) {
  const currentURL = window.location.href;
  const url = new URL(currentURL);

  if (inputIsExecuted == undefined) {
    url.searchParams.delete("isExecuted");
    window.location.href = url.href;
    return;
  }

  url.searchParams.delete("isExecuted");
  url.searchParams.append("isExecuted", inputIsExecuted);

  window.location.href = url.href;
}

function filterByIsDestroyed(inputIsDestroyed) {
  const currentURL = window.location.href;
  const url = new URL(currentURL);

  if (inputIsDestroyed == undefined) {
    url.searchParams.delete("isDestroyed");
    window.location.href = url.href;
    return;
  }

  url.searchParams.delete("isDestroyed");
  url.searchParams.append("isDestroyed", inputIsDestroyed);
  window.location.href = url.href;
}

function filterByKeyword() {
  const currentURL = window.location.href;
  const url = new URL(currentURL);
  const inputKeyword = $("#keyword").val();

  if (!inputKeyword || inputKeyword == "") {
    url.searchParams.delete("keyword");
    window.location.href = url.href;
    return;
  }

  url.searchParams.delete("keyword");
  url.searchParams.append("keyword", inputKeyword);
  window.location.href = url.href;
}
