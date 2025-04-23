function trimText(text, maxLength = 300, maxSentences = 3) {
	const sentenceRegex = /[^.!?]+[.!?]+/g;
	const sentences = text.match(sentenceRegex);
  
	if (sentences) {
	  let trimmedSentences = [];
	  let totalLength = 0;
  
	  for (let sentence of sentences) {
		sentence = sentence.trim();
		if (totalLength + sentence.length > maxLength || trimmedSentences.length >= maxSentences) {
		  break;
		}
		trimmedSentences.push(sentence);
		totalLength += sentence.length;
	  }
  
	  const result = trimmedSentences.join(' ');
	  
	  // If result is valid and different from full text, return with ellipsis
	  if (result.length > 0 && result.length < text.length) {
		return result + '…';
	  }
	}
  
	// Fallback: trim raw text to length
	return text.length > maxLength ? text.slice(0, maxLength).trim() + '…' : text;
  }

function initSlider() {
	if ($('.slider').hasClass('slick-initialized')) {
	  $('.slider').slick('unslick');
	}
  
	$('.slider').slick({
	  dots: true,
	  infinite: true,
	  speed: 600,
	  fade: false,
	  cssEase: 'linear',
	  autoplay: true,
	  autoplaySpeed: 8000,
	  arrows: false,
	  mobileFirst:true,
	  slidesToShow: 1,
	  slidesToScroll: 1,
	  responsive: [
		{
		  breakpoint: 1440,
		  settings: {
			arrows: true,
			slidesToShow: 3,
			slidesToScroll: 3,
		  },
		},
		{
		  breakpoint: 1024,
		  settings: {
			arrows:true,
			slidesToShow: 2,
			slidesToScroll: 2,
		  },
		}
	  ],
	  prevArrow: `
		<button type="button" class="slick-prev custom-arrow">
		  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24">
			<path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z" />
		  </svg>
		</button>
	  `,
	  nextArrow: `
		<button type="button" class="slick-next custom-arrow">
		  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24">
			<path d="M7.293 4.707 14.586 12l-7.293 7.293 1.414 1.414L17.414 12 8.707 3.293 7.293 4.707z"/>
		  </svg>
		</button>
	  `
	});
  }


async function renderReviews() {
	const slider = document.querySelector('.slider');
	try {
	  const response = await fetch('https://us-central1-review-selector.cloudfunctions.net/googleReviews');
	  const reviews = await response.json();
  
	  slider.innerHTML = ''; // Clear loading or placeholder text
  
	  if (!reviews.length) {
		slider.innerHTML = '<p>No reviews found.</p>';
		return;
	  }
  
	  reviews.forEach(review => {
		const slide = document.createElement('div');
		const trimmedText = trimText(review.text, 250, 3);
		const fullText = review.text;

		slide.className = 'slide';
		slide.innerHTML = `
		  <div class="review">
			<div class="author">${review.author}</div>
			<div class="date-star">
				<div class="date">${review.displayDate}</div> 
				<div class="rating">${'⭐'.repeat(review.rating)}</div>
			</div>
			<div class="text">
      			<span class="review-short">${trimmedText}</span>
      			<span class="review-full" style="display: none;">${fullText}</span>
     			${trimmedText !== fullText ? '<button class="read-toggle">Read more</button>' : ''}
			</div>
			<div class="date">${review.relative_time_description || ''}</div>
			<div class="review-img"><img src='./img/${review.source}.png' alt='${review.source}'/></div>
		  </div>
		`;
		slider.appendChild(slide);
	  });

	  // Attach "Read more" toggle logic
		document.querySelectorAll('.read-toggle').forEach(btn => {
			btn.addEventListener('click', () => {
			const textEl = btn.parentElement;
			const shortText = textEl.querySelector('.review-short');
			const fullText = textEl.querySelector('.review-full');
		
			const isExpanded = fullText.style.display === 'inline';
		
			if (isExpanded) {
				fullText.style.display = 'none';
				shortText.style.display = 'inline';
				btn.textContent = 'Read more';
			} else {
				fullText.style.display = 'inline';
				shortText.style.display = 'none';
				btn.textContent = 'Read less';
			}
			});
		});
		
  
	  // Now that slides are added, init the slider
	  const event = new Event('reviewsReady');
	  document.dispatchEvent(event);
  
	} catch (error) {
	  console.error('Error loading reviews:', error);
	  slider.innerHTML = '<p>Failed to load reviews.</p>';
	}
  }

  document.addEventListener('DOMContentLoaded', renderReviews);
  document.addEventListener('reviewsReady', initSlider);