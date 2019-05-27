<script>
  import { Router, Route } from "svelte-routing";

  import Header from "./Components/Header.svelte";
  import MeetupsList from "./Containers/MeetupsList/MeetupsList.svelte";
  import EditMeetup from "./Containers/EditMeetup/EditMeetup.svelte";

  export let url = "";
  let meetups = [
    {
      id: "m1",
      title: "Coding Bootcamp",
      subtitle: "Learn to code in 2 hours",
      description:
        "In this meetup we will have some experts in the web development community that will help you teach how to code! We will be creating 3 websites and we'll be having a lot of fun!",
      imageUrl:
        "https://media.licdn.com/dms/image/C561BAQG-AId6iHvIeA/company-background_10000/0?e=2159024400&v=beta&t=A1iCxUdk2c5nvgPEJ38SCAQjini9ozOA3o47NkYCk8g",
      address: "9200 Irvine Center Dr, Irvine, CA 92618",
      contactEmail: "support@learningfuze.com",
      favorite: false
    },
    {
      id: "m2",
      title: "Coffee & Code OC",
      subtitle: "Let's talk about code!",
      description:
        "Lot's of code and good coffee, what's not to like?! Be there!",
      imageUrl:
        "https://s3-media1.fl.yelpcdn.com/bphoto/urKT6cl0DR3tDNFQlRKJ6g/o.jpg",
      address: " 18100 Culver Dr, Irvine, CA 92612",
      contactEmail: "support@coffee&code.com",
      favorite: false
    },
    {
      id: "m3",
      title: "Coding Bootcamp",
      subtitle: "Learn to code in 2 hours",
      description:
        "In this meetup we will have some experts in the web development community that will help you teach how to code! We will be creating 3 websites and we'll be having a lot of fun!",
      imageUrl:
        "https://media.licdn.com/dms/image/C561BAQG-AId6iHvIeA/company-background_10000/0?e=2159024400&v=beta&t=A1iCxUdk2c5nvgPEJ38SCAQjini9ozOA3o47NkYCk8g",
      address: "9200 Irvine Center Dr, Irvine, CA 92618",
      contactEmail: "support@learningfuze.com",
      favorite: false
    }
  ];

  function handleFavorite(e) {
    const id = e.detail;

    const meetup = meetups.find(mtup => mtup.id === id);
    console.log(meetup);
    meetup.favorite = !meetup.favorite;
    meetups = meetups.slice(0);
  }
</script>

<style>
  main {
    margin-top: 4.5rem;
  }
</style>

<Router {url}>
  <Header />
  <main>
    <Route path="create" component={EditMeetup} />
    <Route path="/">
      <MeetupsList {meetups} on:toggleFavorite={handleFavorite} />
    </Route>
    <!-- <EditMeetup />
    <MeetupsList {meetups} on:toggleFavorite={handleFavorite} /> -->
  </main>
</Router>
