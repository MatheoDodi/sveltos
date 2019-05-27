<script>
  import { Link } from "svelte-routing";
</script>

<style>
  header {
    z-index: 10;
    position: fixed;
    padding: 0.25rem 1.5rem;
    width: 100%;
    top: 0;
    left: 0;
    height: 4rem;
    background-color: #a368fc;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h1 {
    font-weight: lighter;
  }

  ul {
    list-style: none;
    display: flex;
  }
</style>

<header>
  <Link to="/">
    <h1>Sveltos</h1>
  </Link>
  <nav>
    <ul>
      <li class="link">
        <Link to="/create">Create Meetup</Link>
      </li>
    </ul>
  </nav>
</header>
