import { writable } from 'svelte/store';

const meetups = writable([
  {
    id: 'm1',
    title: 'Coding Bootcamp',
    subtitle: 'Learn to code in 2 hours',
    description:
      "In this meetup we will have some experts in the web development community that will help you teach how to code! We will be creating 3 websites and we'll be having a lot of fun!",
    imageUrl:
      'https://media.licdn.com/dms/image/C561BAQG-AId6iHvIeA/company-background_10000/0?e=2159024400&v=beta&t=A1iCxUdk2c5nvgPEJ38SCAQjini9ozOA3o47NkYCk8g',
    address: '9200 Irvine Center Dr, Irvine, CA 92618',
    contactEmail: 'support@learningfuze.com',
    favorite: false
  },
  {
    id: 'm2',
    title: 'Coffee & Code OC',
    subtitle: "Let's talk about code!",
    description:
      "Lot's of code and good coffee, what's not to like?! Be there!",
    imageUrl:
      'https://s3-media1.fl.yelpcdn.com/bphoto/urKT6cl0DR3tDNFQlRKJ6g/o.jpg',
    address: ' 18100 Culver Dr, Irvine, CA 92612',
    contactEmail: 'support@coffee&code.com',
    favorite: false
  },
  {
    id: 'm3',
    title: 'HTML & CSS Fundementals',
    subtitle: 'Learn everything about HTML & CSS!',
    description: `Join us at our Los Angeles HQ in Venice master the fundamentals of HTML and CSS! This workshop is designed specifically with beginners in mind! To get the full experience we recommend coming onsite, however a live-stream will be available if you’re unable to make it.

      This workshop will be a combination of live interactive lecture and pair programming through challenges! You will walk away with a new understanding of the core elements that make up HTML to add content to a web page, and the fundamental pieces of CSS to bring it to life.
      
      We’ll cover the concepts that are the foundation of all web development so you can confidently use them as you work on harder concepts to come.
      
      Specifically:
      
      - Text elements (headings, paragraphs, lists)
      
      - Division elements
      
      - Styling Selectors (elements, class and id)
      
      Price: Always free!
      
      Parking Info: If you’re attending in person we have free parking for the workshop in the lot.
      
      Online Info: Please join us for the online stream of the workshop here: https://codesmith.io/event-signin/325?ol=t (online start time may vary by 30 mins).
      
      Experience Level:
      All experience levels welcome. We recommend getting started on our free JavaScript learning platform CSX (https://csx.codesmith.io/) and working on the Precourse unit before the workshop.
      
      We offer free JavaScript workshops several times a week!
      
      Typically our weekly schedule is:
      
      - Tuesdays: JavaScript The Easier Parts (In-person & Online)
      
      - Wednesdays: Build A Web App (In-person & Online) & JavaScript The Hard Parts (Online Only)
      
      - Thursdays: JavaScript The Hard Parts (In-person & Online)`,
    imageUrl:
      'https://cdn-images-1.medium.com/max/1600/1*UAM0cE0Dko0zTTK443fKZg.jpeg',
    address: '1600 Main St, Venice, CA',
    contactEmail: 'support@codesmith.com',
    favorite: false
  }
]);

export default meetups;
