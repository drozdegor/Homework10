$(document).ready(function () {
  $("form").submit(function (event) {
    var ip = $("#ip").val().trim();

    if (!ip) {
      alert("Пожалуйста, введите IP-адрес");
      return false;
    }

    if (isPrivateIP(ip)) {
      $("#result").html("<p style='color: orange;'>Предупреждение: IP-адрес <strong>" + ip + "</strong> является частным (локальным). Для него невозможно определить геолокацию.</p>");
      return false;
    }

    var formData = { query: ip };
    var url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/iplocate/address?ip=";
    var token = "e2964d4de9b954644ad4e02cd1c27546b3856961";

    $.ajax({
      type: "GET",
      url: url + formData.query,
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Token " + token);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");
      },
      data: '',
      dataType: "json",
      success: function (result) {
        console.log("Полный ответ API:", result); // Отладка: полный ответ

        if (!result.location) {
          displayNoLocation(ip);
          return;
        }

        displayResult(result);
      },
      error: function (xhr, status, error) {
        handleError(xhr, status, error);
      }
    });

    event.preventDefault();
  });
});

function isPrivateIP(ip) {
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./
  ];
  return privateRanges.some(regex => regex.test(ip));
}

function displayResult(result) {
  var resultDiv = $("#result");
  resultDiv.empty();

  var locationData = result.location;
  var html = "<h3>Информация об IP-адресе:</h3><ul>";

  function processValue(value, key) {
    if (value === null || value === undefined) {
      return "не указано";
    }
    if (typeof value === 'object') {
      var items = [];
      for (var subKey in value) {
        if (value.hasOwnProperty(subKey)) {
          items.push(subKey + ": " + processValue(value[subKey], subKey));
        }
      }
      return items.join("; ");
    }
    return value;
  }

  for (var key in locationData) {
    if (locationData.hasOwnProperty(key)) {
      var value = locationData[key];
      html += "<li><strong>" + key + ":</strong> " + processValue(value, key) + "</li>";
    }
  }

  html += "</ul>";
  resultDiv.html(html);
}

function displayNoLocation(ip) {
  $("#result").html("<p>Для IP-адреса <strong>" + ip + "</strong> геолокация не найдена.</p>");
}

function handleError(xhr, status, error) {
  var resultDiv = $("#result");

  if (xhr.status === 401) {
    resultDiv.html("<p style='color: red;'>Ошибка авторизации. Проверьте API-ключ.</p>");
  } else if (xhr.status === 400) {
    resultDiv.html("<p style='color: red;'>Неверный IP-адрес или параметры запроса.</p>");
  } else {
    resultDiv.html("<p style='color: red;'>Произошла ошибка: " + error + "</p>");
  }
}
