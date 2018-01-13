#!/usr/bin/env ruby

#
# Yaml を読み込んで、それを Trello のカード化する
#
# ```yaml
# model:
#   action:
#     - key: /some/path/like/key
#       type: page
#       url: https://example.com
# ```
#
# `model` がリスト
# 各 action がカード
# key  => カード名
# type => ラベル
# url  => attachment
#

require 'pp'
require 'trello'
require 'yaml'

# Constans
LABELS = {
  'status: complete' => 'green',
  'status: draft' => 'yellow',
  'type: modal' => 'purple',
  'type: page' => 'blue',
}

# Deal with arguments
if ARGV.empty?
  p "username for trello required"
  exit(1)
end

username = ARGV[0]
board_name = ARGV[1] 
board_name ||= "Page List"

Trello.configure do |config|
  config.developer_public_key = ENV['TRELLO_API_KEY']
  config.member_token = ENV['TRELLO_API_TOKEN']
end

def initialize_board(username, board_name)
  me = Trello::Member.find(username)
  board = me.boards.select do |board|
    board.name == board_name
  end.first

  if board.nil?
    board = Trello::Board.create({
      name: board_name,
      # default_lists: false # sadly, it's not supported yet :(
      })
    board.lists.each do |list|
      # since default lists will be created, close them to make board clean
      list.close!
    end
  end

  board
end

def initialize_labels(board)
  labels = board.labels.map{|l| l.name }

  LABELS.each do |(name, colour)|
    if !labels.include?(name)
      Trello::Label.create({
        name: name,
        board_id: board.id,
        color: colour,
        })
    end
  end
  board.labels
end

def setup(yaml_file, username, board_name)
  board = initialize_board(username, board_name)
  labels = initialize_labels(board)
  lists = board.lists

  yml = YAML.load_file(yaml_file)

  yml.each do |(model, actions)|
    list = lists.select{ |l| l.name == model }.first
    if list.nil?
      p "creating new list: #{model}"
      list = Trello::List.create({
        name: model,
        board_id: board.id,
        })
    end
    cards = list.cards

    actions.each do |(action, pages)|
      pages.each do |page|
        key = page['key']
        if key.nil?
          p "No key found"
          pp page
          next
        end

        card = cards.select{ |c| c.name == key }.first
        if card.nil?
          p "creating new card: #{key}"
          card = Trello::Card.create({
            name: key,
            list_id: list.id,
            })
          card.add_attachment(page['url'])
          label = labels.select{ |l| l.name == "type: #{page['type']}" }.first
          card.add_label(label) if !label.nil?
        end
      end
    end
  end
end

setup('sample.yaml', username, board_name)