const posts = [
	{
		url: "/assets/birds/caffeine.gif",
		description: "This is Sofia. Sofia really likes coffee. Like, really likes Coffee. She hasn't even had any yet and it's giving her the jitters. 13/10 would help caffeinate.",
		rating: 12,
	},
	{
		url: "/assets/birds/intense.gif",
		description: "Meet Cathy. Cathy thinks back to the time she saw a mouse to eat, but then the human connected it to the computer and turned it into a cyborg mouse. Cathy is still mad. 12/10 here you can have my mouse.",
		rating: 13,
	},
	{
		url: "/assets/birds/dab.gif",
		description: "Charles is the coolest kid in middle school. He really wants to show you the way he dabs. 11/10 phenomenal dab, Charles.",
		rating: 11,
	},
	{
		url: "/assets/birds/wet.gif",
		description: "It's Tuesday so that means Ayaz gets a bath today. She has been very excited about Tuesday, and baths, and water, and cleaning. Ayaz really likes the water. 13/10 great hygeine, Ayaz.",
		rating: 13,
	},
	{
		url: "/assets/birds/big-bird.gif",
		description: "Pretty sure that Sandy isn't a bird. But I'm not an ornithologist, I'm just a website. What do I know? 11/10 still beautiful.",
		rating: 11,
	},
	{
		url: "/assets/birds/hat.gif",
		description: "James is going through a mid-life crisis right now. He can't decide if he wants to be a bird or a hat. He tells me that he's leaning toward hat. 12/10 follow your dreams, James.",
		rating: 12,
	}
];


$(window).on("load", () => {
	let template = $("#post").text();
	let ratingSection = $("#ratings");
	for (let post of posts) {
		let rating = template.slice()	
		for (let key of Object.keys(post)) {
			rating = rating.replace(`{{${key}}}`, post[key]);
		}
		let ratingElement = $(rating);
		ratingSection.append(ratingElement);
	}
})