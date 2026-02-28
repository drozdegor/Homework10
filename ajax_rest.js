$(document).ready(function () {
  $("form").submit(function (event) {
    var ip = $("#ip").val().trim();

    if (!ip) {
      alert("Пожалуйста, введите IP-адрес");
      return;
    }

    var token = "caefb54715667bc050e99cda7b5558dc1893b9e2";
    var url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/iplocate/ip";

    $.ajax({
      type: "GET",
      url: url + "?ip=" + encodeURIComponent(ip),
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Token " + token);
        xhr.setRequestHeader("Content-Type", "application/json");
      },
      dataType: "json",
      encode: true
    }).done(function (result) {
      displayCity(result);
    }).fail(function (jqXHR, textStatus, errorThrown) {
      handleError(jqXHR, textStatus, errorThrown);
    });

    event.preventDefault();
  });
});

function displayCity(data) {
  var resultDiv = $("#result");
  var cityName = "Информация о городе не найдена";

  if (data && data.location && data.location.city && data.location.city.name) {
    cityName = data.location.city.name;
  }

  var html = "<div class='city-result'>";
  html += "<h3>Результат определения города по IP:</h3>";
  html += "<p><strong>Город:</strong> <span class='city-name'>" + cityName + "</span></p>";

  if (data && data.ip) {
    html += "<details>";
    html += "<summary>Дополнительная информация</summary>";
    html += "<p><strong>IP-адрес:</strong> " + data.ip + "</p>";
    if (data.location && data.location.country && data.location.country.name) {
      html += "<p><strong>Страна:</strong> " + data.location.country.name + "</p>";
    }
    if (data.location && data.location.region && data.location.region.name) {
      html += "<p><strong>Регион:</strong> " + data.location.region.name + "</p>";
    }
    if (data.location && data.location.geo && data.location.geo.lat && data.location.geo.lon) {
      html += "<p><strong>Координаты:</strong> " +
        data.location.geo.lat + ", " + data.location.geo.lon + "</p>";
    }
    html += "</details>";
  }
  html += "</div>";

  resultDiv.html(html);
}

function handleError(jqXHR, textStatus, errorThrown) {
  var resultDiv = $("#result");
  resultDiv.html(
    "<div class='error-message'>" +
    "<p style='color: red;'>Ошибка при выполнении запроса: " + textStatus + "</p>" +
    "<p>Проверьте правильность IP‑адреса и доступность API</p>" +
    "</div>"
  );
  console.error("Ошибка API Dadata:", jqXHR, textStatus, errorThrown);
}
