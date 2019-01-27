$(document).ready(() => {
	$(".share").click((e) => {
		let url = $(e.target).attr("url");
		let alert = $(`
<div class="boundary">
	<div class="alert">
		<textarea class="copy-content">${url}</textarea>
		<input class="close" type="button" value="Close"></input>
	</div>
</div>
`);
		$(document.body).append(alert);
		$(".close").click(() => {
			alert.remove();
		});
	})
})