<script>
  export let content;
</script>

<style>
  button {
    border-radius: 4px;
    background: white;
    color: #a368fc;
    padding: 8.5px 13.5px;
    border: 1.5px solid #a368fc;
    font-size: 1rem;
    outline-color: #a368fc;
  }

  button:hover {
    border-color: #9446ed;
    color: #9446ed;
    cursor: pointer;
  }

  button:active {
    border-color: #8719e0;
    background: #f2ebfe;
    color: #8719e0;
  }
</style>

<button on:click|preventDefault>{content}</button>
