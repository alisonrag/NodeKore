#############################################################################
# NodeKore by alisonrag
# based in:
# NodeKore plugin by sctnightcore
#############################################################################
package NodeKore;
	
use strict;
use Plugins;
use Commands;
use Data::Dumper;
use Log qw( message );
use Misc;
use Globals;
use Utils;
use AI;

# Plugin
Plugins::register('NodeKore', "send and receive chat of discord via BUS", \&unload);

my $networkHook = Plugins::addHooks(
	['Network::stateChanged',		\&init, undef],
	['packet_privMsg',				\&on_private_chat, undef],
	['base_level_changed',			\&base_level_changed, undef],
	['job_level_changed',			\&job_level_changed, undef],
	['self_died',					\&self_died, undef],
	['disconnected',				\&disconnected, undef],
	['AI_pre',						\&on_ai, undef]
);

my $bus_message_received;
my %bus_sendinfo_timeout = (timeout => 6);

sub init {
	my ($self, $args) = @_;
	return if ($::net->getState() == 1);
	if (!$bus) {
		die("\n\n[NodeKore] You MUST start BUS server and configure each bot to use it in order to use this plugin. Open and edit line \"bus 0\" to bus 1 inside control/sys.txt \n\n");
	} elsif (!$bus_message_received) {
		$bus_message_received = $bus->onMessageReceived->add(undef, \&bus_message_received);
	}
}

sub bus_message_received {
	my (undef, undef, $msg) = @_;

	if ( $msg->{args}->{ID} && ( $msg->{args}->{ID} eq "all" || $msg->{args}->{ID} eq $char->{name} || $msg->{args}->{ID} eq unpack('V',$accountID) ) ) {
		message sprintf("[NodeKore] Received BUS message MID: %s  To: %s\n",$msg->{messageID}, $msg->{args}->{ID}), "bus";
		if (($msg->{messageID} eq 'DISCORD_PM')) {
			my $user = $msg->{args}->{to};
			my $message = $msg->{args}->{message};
			sendMessage($messageSender, "pm", $message, $user);
		}

		if (($msg->{messageID} eq 'DISCORD_RELOG')) {
			my $time;
			$time = ($msg->{args}->{time}) ? $msg->{args}->{time} : 600;
			Commands::run("relog $time");
		}

		if (($msg->{messageID} eq 'DISCORD_QUIT')) {
			Commands::run("quit 2");
		}
	}
}

sub on_private_chat {
	my ($self, $args) = @_;
	my %data = (
		from => $args->{privMsgUser},
		to => $char->{name},
		message => $args->{privMsg}
	);
	$bus->send('BOT_DISCORD_PM', \%data);
}

sub base_level_changed {
	sendCharacterData('BOT_BASE_LEVEL_CHANGED');
}

sub job_level_changed {
	sendCharacterData('BOT_JOB_LEVEL_CHANGED');
}

sub self_died {
	sendCharacterData('BOT_DIED');
}

sub disconnected {
	sendCharacterData('BOT_DISCONNECTED');
}

sub on_ai {
	if (timeOut(\%bus_sendinfo_timeout)) {
		sendCharacterData('BOT_INFO');
	}
}

sub sendCharacterData {
	my ($MID) = shift;

	if ($char) {
		my %info = (
			accountID => unpack('V', $accountID),
			name => $char->{name},
			lv => $char->{lv},
			lv_job => $char->{lv_job},
			zeny => $char->{zeny},
			location => $field->baseName.' '.$char->{pos}{x}.','.$char->{pos}{y},
		);
		$bus->send($MID, \%info);
	}

	$bus_sendinfo_timeout{time} = time;
}

# Plugin unload
sub unload {
	message "[NodeKore] unloading.\n", 'system';
	Plugins::delHooks($networkHook);
	$bus->onMessageReceived->remove($bus_message_received) if $bus_message_received;
	undef $bus_message_received;
	undef %bus_sendinfo_timeout;
}
	
1;